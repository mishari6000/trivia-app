/// <reference types="node" />
// Generates Arabic questions for every category and level with OpenRouter, fact-checks each
// one, and saves the approved ones to src/data/bank.json (shipped in the app).
//
// Usage: node scripts/generate-questions.mts [--target 100] [--only "History,Sports"]
//          [--checker anthropic/claude-sonnet-5.5] [--budget 10] [--recheck]
// The API key is read from OPENROUTER_API_KEY, or asked for with hidden input. It is never
// written to disk, and must never be committed or shipped inside the app.
//
// Spending is added up in bank.json across runs and never passes the budget (default $10):
// before every request (retries too) its worst-case cost is reserved, and nothing is sent if
// spent + reserved could go over.
// Safety: one fixed model per step (the run stops if another model answers); written
// questions are saved to scripts/pending-questions.json before they are checked, so a failed
// check never throws them away; three cut-off or unreadable answers in a row stop the run.

import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { questions as handWritten } from '../src/data/questions.ts';
import type { Bank, BankQuestion, BankCategoryName, Difficulty } from '../src/types/question.ts';
import {
  applyCheck,
  BATCH_SIZE,
  BUDGET_USD,
  buildCheckRequest,
  buildWriteRequest,
  CATEGORY_NAMES,
  CHECKER_MODEL,
  costOf,
  maxCallCost,
  DIFFICULTIES,
  normalize,
  OPENROUTER_URL,
  parseWritten,
  TARGET_PER_LEVEL,
  WRITER_MODEL,
} from './questionGen.ts';

const BANK_PATH = path.join('src', 'data', 'bank.json');
const PENDING_PATH = path.join('scripts', 'pending-questions.json');
const PARALLEL = 10;
const MAX_ROUNDS = 15;
const MAX_FAILURES_IN_A_ROW = 3;
/** Questions sent to the writer as «don't repeat these»: this level's, then the category's others. */
const AVOID_SAME_LEVEL = 200;
const AVOID_OTHER_LEVELS = 100;

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}
const target = Number(arg('target') ?? TARGET_PER_LEVEL);
const budget = Number(arg('budget') ?? BUDGET_USD);
const checker = arg('checker') ?? CHECKER_MODEL;
const recheck = process.argv.includes('--recheck');
const only = arg('only')?.split(',').map((s) => s.trim()) as BankCategoryName[] | undefined;
const unknown = only?.filter((c) => !CATEGORY_NAMES.includes(c)) ?? [];
if (unknown.length) throw new Error(`Unknown category: ${unknown.join(', ')}`);

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const { stdin, stdout } = process;
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let value = '';
    const onData = (chunk: string) => {
      // A paste arrives as one chunk, often wrapped in bracketed-paste markers
      // (ESC[200~ … ESC[201~). Drop those and keep only printable ASCII key characters.
      const text = chunk.replace(/\u001b\[20[01]~/g, '');
      for (const char of text) {
        if (char === '\r' || char === '\n') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off('data', onData);
          stdout.write('\n');
          resolve(value);
          return;
        }
        if (char === '\u0003') process.exit(1);
        if (char === '\u0008' || char === '\u007f') value = value.slice(0, -1);
        else if (/^[\x21-\x7e]$/.test(char)) value += char;
      }
    };
    stdin.on('data', onData);
  });
}

// ---- State on disk: the bank (shipped) and the written-but-unchecked questions (not shipped).
const bank: Bank = existsSync(BANK_PATH)
  ? JSON.parse(readFileSync(BANK_PATH, 'utf8'))
  : { meta: { spentUsd: 0, writer: [], checker: [], updatedAt: null }, questions: [] };
let pending: BankQuestion[] = existsSync(PENDING_PATH) ? JSON.parse(readFileSync(PENDING_PATH, 'utf8')) : [];

if (recheck) {
  // Send every saved question back through the checker.
  pending = [...bank.questions, ...pending];
  bank.questions = [];
}
const known = new Set(
  [...handWritten, ...bank.questions, ...pending].map((q) => normalize(q.question)),
);

function writeAtomic(file: string, text: string) {
  writeFileSync(`${file}.tmp`, text);
  // On Windows a watcher (Metro, OneDrive) can hold the file for a moment: retry, then
  // fall back to writing it in place.
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      renameSync(`${file}.tmp`, file);
      return;
    } catch (error) {
      if (!['EPERM', 'EBUSY', 'EACCES'].includes((error as NodeJS.ErrnoException).code ?? '')) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
    }
  }
  writeFileSync(file, text);
}

function save() {
  const order = (q: BankQuestion) =>
    CATEGORY_NAMES.indexOf(q.category as BankCategoryName) * 10 + DIFFICULTIES.indexOf(q.difficulty);
  bank.questions.sort((a, b) => order(a) - order(b) || a.id.localeCompare(b.id));
  bank.meta = {
    spentUsd: Math.round(bank.meta.spentUsd * 1e6) / 1e6,
    writer: [WRITER_MODEL],
    checker: [checker],
    updatedAt: new Date().toISOString(),
  };
  // One question per line keeps git diffs readable.
  const lines = bank.questions.map((q) => `    ${JSON.stringify(q)}`).join(',\n');
  writeAtomic(BANK_PATH, `{\n  "meta": ${JSON.stringify(bank.meta)},\n  "questions": [\n${lines}\n  ]\n}\n`);
  writeAtomic(PENDING_PATH, `[\n${pending.map((q) => `  ${JSON.stringify(q)}`).join(',\n')}\n]\n`);
}

const count = (category: BankCategoryName, difficulty: Difficulty) =>
  bank.questions.filter((q) => q.category === category && q.difficulty === difficulty).length;
/** Worst-case cost of the requests in flight right now. */
let reserved = 0;
/** Room for at least one more full batch (a write and a check at their worst case). */
const canSpend = () => bank.meta.spentUsd + reserved + 0.02 < budget;

class Fatal extends Error {}
class BudgetReached extends Fatal {}

type Reply = { content: string; truncated: boolean };
const loggedModels = new Set<string>();

async function call(
  apiKey: string,
  body: { model: string; max_tokens: number; messages: unknown },
): Promise<Reply> {
  const worst = maxCallCost(body);
  for (let attempt = 0; ; attempt++) {
    // Once the run is stopping, no worker sends anything new.
    if (stopped) throw new Fatal(stopped);
    if (bank.meta.spentUsd + reserved + worst > budget) throw new BudgetReached('budget');
    reserved += worst;
    let res: Response | undefined;
    let json: {
      model?: string;
      error?: { message?: string };
      usage?: object;
      choices?: { finish_reason?: string; message?: { content?: string } }[];
    } = {};
    try {
      res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://trivia-app-phi-two.vercel.app',
          'X-OpenRouter-Title': 'Trivia App question bank',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(180_000),
      });
      json = await res.json();
    } catch (error) {
      if (attempt >= 3) {
        reserved -= worst;
        bank.meta.spentUsd += worst; // unknown cost (timeout?): count the worst case
        throw error;
      }
    }
    reserved -= worst;
    // No reported cost (timeout, broken body): count the worst case, never zero.
    bank.meta.spentUsd += json.usage ? costOf(json) : worst;
    if (res && [401, 402, 403].includes(res.status)) {
      throw new Fatal(`OpenRouter ${res.status}: ${json.error?.message ?? 'key or credit problem'}`);
    }
    if (json.model && !json.model.startsWith(body.model)) {
      throw new Fatal(`Asked for ${body.model} but ${json.model} answered — stopping.`);
    }
    if (json.model && !loggedModels.has(body.model)) {
      loggedModels.add(body.model);
      console.log(`  (${json.model} answered · usage ${JSON.stringify(json.usage)})`);
    }
    const choice = json.choices?.[0];
    const content = choice?.message?.content;
    if (res?.ok && !json.error && content) {
      return { content, truncated: choice?.finish_reason === 'length' };
    }
    if (attempt >= 3) throw new Error(`OpenRouter ${res?.status}: ${json.error?.message ?? 'no content'}`);
    await new Promise((r) => setTimeout(r, 3_000 * 2 ** attempt));
  }
}

let failuresInARow = 0;

/** A cut-off or unreadable answer; three in a row stop the run instead of paying for more. */
function failed(what: string) {
  failuresInARow++;
  if (failuresInARow >= MAX_FAILURES_IN_A_ROW) {
    throw new Fatal(`${what} — ${failuresInARow} times in a row, stopping.`);
  }
}

/** Checks questions (all one category and level) and moves the approved ones into the bank. */
async function check(apiKey: string, items: BankQuestion[]): Promise<number> {
  const reply = await call(apiKey, buildCheckRequest(items, checker));
  const approved = reply.truncated ? null : applyCheck(items, reply.content);
  if (approved === null) {
    // Unreadable answer: the questions stay pending for the next run.
    failed(`Check answer ${reply.truncated ? 'cut off at the token limit' : 'not valid JSON'}`);
    return 0;
  }
  failuresInARow = 0;
  const ids = new Set(items.map((q) => q.id));
  pending = pending.filter((q) => !ids.has(q.id));
  const { category, difficulty } = items[0];
  const room = Math.max(0, target - count(category as BankCategoryName, difficulty));
  bank.questions.push(...approved.slice(0, room));
  save();
  return Math.min(approved.length, room);
}

/** One batch for one category and level: write (saved as pending), then check. */
async function batch(apiKey: string, category: BankCategoryName, difficulty: Difficulty) {
  const own = [...bank.questions, ...pending].filter((q) => q.category === category);
  const avoid = [
    ...own.filter((q) => q.difficulty === difficulty).slice(-AVOID_SAME_LEVEL),
    ...[...handWritten, ...own].filter((q) => q.category === category && (q as BankQuestion).difficulty !== difficulty).slice(-AVOID_OTHER_LEVELS),
  ].map((q) => q.question);
  const reply = await call(apiKey, buildWriteRequest(category, difficulty, avoid));
  const parsed = reply.truncated ? [] : parseWritten(reply.content, category, difficulty);
  if (!parsed.length) failed(`Write answer ${reply.truncated ? 'cut off at the token limit' : 'empty or not valid JSON'}`);
  else failuresInARow = 0;
  const written = parsed.filter((q) => !known.has(normalize(q.question)));
  written.forEach((q) => known.add(normalize(q.question)));
  pending.push(...written);
  save();
  if (!written.length || !canSpend()) return { written: written.length, kept: 0 };
  return { written: written.length, kept: await check(apiKey, written) };
}

const apiKey = process.env.OPENROUTER_API_KEY || (await askHidden('OpenRouter API key (hidden): '));
if (!apiKey) throw new Error('No API key provided.');

const categories = only ?? CATEGORY_NAMES;
console.log(
  `Writer ${WRITER_MODEL} · checker ${checker} · target ${target} per level · ` +
    `spent so far $${bank.meta.spentUsd.toFixed(3)} of $${budget}`,
);

let stopped = '';
async function runPool<T>(tasks: T[], run: (task: T) => Promise<void>) {
  let next = 0;
  const worker = async () => {
    while (next < tasks.length && !stopped) {
      const task = tasks[next++];
      if (!canSpend()) {
        stopped = 'budget';
        return;
      }
      try {
        await run(task);
      } catch (error) {
        if (error instanceof BudgetReached) stopped ||= 'budget';
        else if (error instanceof Fatal) stopped ||= error.message;
        else console.log(`  skipped (${(error as Error).message})`);
      }
    }
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));
}

// 1. Questions written earlier but never checked (or sent back with --recheck).
if (pending.length) {
  const groups = new Map<string, BankQuestion[]>();
  for (const q of pending) {
    const key = `${q.category}|${q.difficulty}`;
    groups.set(key, [...(groups.get(key) ?? []), q]);
  }
  const chunks = [...groups.values()].flatMap((g) =>
    Array.from({ length: Math.ceil(g.length / BATCH_SIZE) }, (_, i) => g.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)),
  );
  console.log(`\nChecking ${pending.length} saved questions first`);
  await runPool(chunks, async (items) => {
    const kept = await check(apiKey, items);
    console.log(`  ${items[0].category} · ${items[0].difficulty}: kept ${kept}/${items.length} ($${bank.meta.spentUsd.toFixed(3)})`);
  });
}

// 2. New questions, round-robin: every category and level gets one batch per round, so if
// the budget runs out early, all of them still end up with questions.
for (let round = 1; round <= MAX_ROUNDS && !stopped; round++) {
  const queue = categories.flatMap((c) =>
    DIFFICULTIES.filter((d) => count(c, d) < target).map((d) => [c, d] as const),
  );
  if (!queue.length) break;
  console.log(`\nRound ${round}: ${queue.length} to fill`);
  await runPool(queue, async ([category, difficulty]) => {
    const { written, kept } = await batch(apiKey, category, difficulty);
    console.log(
      `  ${category} · ${difficulty}: +${kept}/${written} → ${count(category, difficulty)} ` +
        `($${bank.meta.spentUsd.toFixed(3)})`,
    );
  });
}

save();
console.log(`\n${stopped === 'budget' ? 'Stopped at the budget cap.' : stopped || 'Done.'}`);
console.log(
  `Bank: ${bank.questions.length} questions · ${pending.length} waiting for a check · ` +
    `spent $${bank.meta.spentUsd.toFixed(3)} of $${budget}`,
);
for (const c of categories) {
  console.log(`  ${c}: ${DIFFICULTIES.map((d) => `${d} ${count(c, d)}`).join(' · ')}`);
}
