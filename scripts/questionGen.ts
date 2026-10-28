import type { BankQuestion, CategoryName, Difficulty } from '../src/types/question';

/**
 * Offline question generation with OpenRouter, shared by scripts/generate-questions.ts and
 * its tests. Runs only on a developer's machine: the app never calls OpenRouter and never
 * sees the key. Results are saved to src/data/bank.json and ship inside the app.
 */
export const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Exactly one model per step, with no fallback: a silent switch to another model once sent
 * every check to a model that spent the token limit thinking, so its answers were cut off.
 * These models take no `temperature`, so none is sent (with `require_parameters` it would
 * rule them out).
 */
export const WRITER_MODEL = 'anthropic/claude-haiku-5.5';
/** Fact-checks every question before it is kept. `--checker` can pick a stronger one. */
export const CHECKER_MODEL = 'anthropic/claude-haiku-5.5';

/** Hard spending cap for all runs together (tracked in bank.json). */
export const BUDGET_USD = 10;
/** Questions kept per category and level. */
export const TARGET_PER_LEVEL = 200;
/** Questions asked for in each request. */
export const BATCH_SIZE = 20;

/** USD per million tokens, used only if OpenRouter does not report a request's cost. */
const PRICES: Record<string, { input: number; output: number }> = {
  'anthropic/claude-haiku-5.5': { input: 0.1, output: 0.5 },
  'google/gemini-3.1-flash-lite': { input: 0.25, output: 1.5 },
  'anthropic/claude-sonnet-5.5': { input: 2, output: 10 },
  'google/gemini-3.5-flash': { input: 1.5, output: 9 },
};
const FALLBACK_PRICE = { input: 2, output: 10 };

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

const LEVEL_GUIDE: Record<Difficulty, string> = {
  easy: 'EASY: famous facts most teenagers and adults know, school level.',
  medium: 'MEDIUM: needs a real interest in the topic or good general culture, but not obscure.',
  hard: 'HARD: for enthusiasts — specific names, dates, numbers or details; still well documented, never a trick.',
};

/** What each category is about, for the prompt (Arabic label + English topic hint). */
export const CATEGORY_TOPICS: Record<CategoryName, { label: string; topic: string }> = {
  'General Knowledge': { label: 'معلومات عامة', topic: 'general knowledge' },
  'Entertainment: Books': { label: 'كتب', topic: 'famous books, authors and literature, Arabic and world' },
  'Entertainment: Film': { label: 'أفلام', topic: 'well-known films, directors and cinema history' },
  'Entertainment: Music': { label: 'موسيقى', topic: 'music, instruments, famous songs and musicians' },
  'Entertainment: Musicals & Theatres': { label: 'مسرح', topic: 'theatre, plays and stage musicals' },
  'Entertainment: Television': { label: 'تلفزيون', topic: 'television history and famous TV shows' },
  'Entertainment: Video Games': { label: 'ألعاب فيديو', topic: 'video games, consoles and game history' },
  'Entertainment: Board Games': { label: 'ألعاب لوحية', topic: 'board games, chess and card games' },
  'Science & Nature': { label: 'علوم وطبيعة', topic: 'science and nature' },
  'Science: Computers': { label: 'كمبيوتر', topic: 'computers, the internet and programming basics' },
  'Science: Mathematics': { label: 'رياضيات', topic: 'mathematics: numbers, shapes and famous concepts' },
  Mythology: { label: 'أساطير', topic: 'world mythology and legends' },
  Sports: { label: 'رياضة', topic: 'sports, rules and major tournaments' },
  Geography: { label: 'جغرافيا', topic: 'world geography: countries, capitals, landmarks' },
  History: { label: 'تاريخ', topic: 'world and Arab history' },
  Politics: { label: 'سياسة', topic: 'political systems and international organisations (no opinions)' },
  Art: { label: 'فن', topic: 'art, painters and famous artworks' },
  Celebrities: { label: 'مشاهير', topic: 'famous historical figures, scientists and inventors' },
  Animals: { label: 'حيوانات', topic: 'animals and their facts' },
  Vehicles: { label: 'مركبات', topic: 'cars, planes, trains and how vehicles work' },
  'Entertainment: Comics': { label: 'قصص مصوّرة', topic: 'comics and comic book history' },
  'Science: Gadgets': { label: 'أجهزة', topic: 'gadgets and everyday technology' },
  'Entertainment: Japanese Anime & Manga': { label: 'أنمي ومانجا', topic: 'popular anime and manga' },
  'Entertainment: Cartoon & Animations': { label: 'رسوم متحركة', topic: 'cartoons and animated films' },
};

export const CATEGORY_NAMES = Object.keys(CATEGORY_TOPICS) as CategoryName[];

export const normalize = (s: string) =>
  s
    .trim()
    .replace(/[؟?!.،,«»"']/g, '')
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .toLowerCase();

/** Short stable id from the question text (FNV-1a), so reruns never clash. */
export function questionId(difficulty: Difficulty, question: string): string {
  let hash = 0x811c9dc5;
  for (const char of normalize(question)) {
    hash ^= char.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `${difficulty[0]}-${hash.toString(36)}`;
}

/** Strict JSON schemas, so the models can only answer in the exact shape needed. */
const WRITE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['questions'],
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['question', 'correctAnswer', 'incorrectAnswers'],
        properties: {
          question: { type: 'string' },
          correctAnswer: { type: 'string' },
          incorrectAnswers: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};

const CHECK_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['results'],
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['n', 'ok', 'level'],
        properties: {
          n: { type: 'integer' },
          ok: { type: 'boolean' },
          level: { type: 'string', enum: DIFFICULTIES },
        },
      },
    },
  },
};

const common = (name: string, schema: object) => ({
  // Only route to providers that honour the JSON schema.
  provider: { require_parameters: true },
  usage: { include: true },
  response_format: { type: 'json_schema', json_schema: { name, strict: true, schema } },
});

/** Asks the writer for a batch of new questions, avoiding everything the category already has. */
export function buildWriteRequest(
  category: CategoryName,
  difficulty: Difficulty,
  avoid: string[],
  count = BATCH_SIZE,
) {
  const { label, topic } = CATEGORY_TOPICS[category];
  const avoidList = avoid.length
    ? `\n\nهذه أسئلة موجودة عندنا، لا تكررها ولا تكتب سؤالًا بنفس المعلومة:\n${avoid.map((q) => `- ${q}`).join('\n')}`
    : '';
  return {
    model: WRITER_MODEL,
    max_tokens: 6_000,
    // Haiku 5.5 thinks at medium effort by default, and thinking shares max_tokens: it cut
    // off many answers. Writing needs no thinking.
    reasoning: { effort: 'none' },
    ...common('trivia_questions', WRITE_SCHEMA),
    messages: [
      {
        role: 'system',
        content: [
          'You write multiple-choice trivia questions for an Arabic quiz game played in Kuwait.',
          'Write in clear Modern Standard Arabic. Each question ends with «؟».',
          'Rules: every fact must be accurate, well established and not time-sensitive',
          '(no "current", "latest" or records that may change);',
          'no opinions, no disputed facts, no religious rulings, no questions about living politicians;',
          'exactly one correct answer and three plausible but clearly wrong answers;',
          'all four answers distinct and short (at most 6 words); no "all of the above";',
          'questions at most 20 words; cover many different sub-topics; never repeat a fact.',
          'Where natural, include some questions about the Arab world and the Gulf.',
          `Every question must be at this level — ${LEVEL_GUIDE[difficulty]}`,
        ].join(' '),
      },
      {
        role: 'user',
        content: `اكتب ${count} أسئلة جديدة ومتنوعة في فئة «${label}» (${topic}).${avoidList}`,
      },
    ],
  };
}

/** Asks the checker to verify each numbered question and rate its level. */
export function buildCheckRequest(items: BankQuestion[], model = CHECKER_MODEL) {
  const list = items
    .map(
      (q, n) =>
        `${n}. ${q.question}\n   الصحيحة: ${q.correctAnswer}\n   الخاطئة: ${q.incorrectAnswers.join(' | ')}`,
    )
    .join('\n');
  return {
    model,
    max_tokens: 8_000,
    // A little thinking helps fact-checking; the token limit leaves room for the answer.
    reasoning: { effort: 'low' },
    ...common('trivia_check', CHECK_SCHEMA),
    messages: [
      {
        role: 'system',
        content: [
          'You are a strict fact-checker for an Arabic trivia game. For each numbered question,',
          'set ok=true ONLY if: the marked correct answer is definitely correct; each of the three wrong',
          'answers is definitely wrong; the question is clear, has one answer and is not time-sensitive;',
          'and the Arabic is correct. When in doubt, ok=false.',
          'Also rate how hard it is for a general Arab audience: easy, medium or hard.',
          'Return one result per question, with n = its number.',
        ].join(' '),
      },
      { role: 'user', content: list },
    ],
  };
}

/** Model JSON, tolerating a ```json fence around it. */
function parseJson(content: string): unknown {
  try {
    return JSON.parse(content.trim().replace(/^```(?:json)?\s*|\s*```$/g, ''));
  } catch {
    return undefined;
  }
}

/** Validates the writer's JSON and returns only well-formed, unambiguous questions. */
export function parseWritten(content: string, category: CategoryName, difficulty: Difficulty): BankQuestion[] {
  const data = parseJson(content);
  const items = (data as { questions?: unknown })?.questions;
  if (!Array.isArray(items)) return [];

  const seen = new Set<string>();
  const out: BankQuestion[] = [];
  for (const raw of items) {
    const q = raw as { question?: unknown; correctAnswer?: unknown; incorrectAnswers?: unknown };
    if (typeof q.question !== 'string' || typeof q.correctAnswer !== 'string') continue;
    if (!Array.isArray(q.incorrectAnswers) || q.incorrectAnswers.length !== 3) continue;
    if (!q.incorrectAnswers.every((a) => typeof a === 'string')) continue;

    const question = q.question.trim();
    const answers = [q.correctAnswer, ...q.incorrectAnswers].map((a: string) => a.trim());
    if (!question || question.length > 160 || answers.some((a) => !a || a.length > 60)) continue;
    if (new Set(answers.map(normalize)).size !== 4) continue;
    if (seen.has(normalize(question))) continue;
    seen.add(normalize(question));

    out.push({
      id: questionId(difficulty, question),
      category,
      difficulty,
      question,
      correctAnswer: answers[0],
      incorrectAnswers: [answers[1], answers[2], answers[3]],
    });
  }
  return out;
}

/**
 * Keeps the questions the checker approved, whose level is no more than one step from the
 * one asked for (an «easy» rated hard, or the reverse, is dropped). Returns null when the
 * checker's answer cannot be read, so the caller can tell a failed check from a strict one.
 */
export function applyCheck(items: BankQuestion[], content: string): BankQuestion[] | null {
  const data = parseJson(content);
  const results = (data as { results?: unknown })?.results;
  if (!Array.isArray(results)) return null;

  const approved = new Set<number>();
  for (const raw of results) {
    const r = raw as { n?: unknown; ok?: unknown; level?: unknown };
    const n = Number(r.n);
    if (!Number.isInteger(n) || r.ok !== true || !items[n]) continue;
    const rated = DIFFICULTIES.indexOf(r.level as Difficulty);
    const asked = DIFFICULTIES.indexOf(items[n].difficulty);
    if (rated === -1 || Math.abs(rated - asked) > 1) continue;
    approved.add(n);
  }
  return items.filter((_, n) => approved.has(n));
}

/**
 * The most a request can cost: every prompt character counted as a token (an overestimate)
 * and the full max_tokens of output. Reserved before sending, so the budget is never passed.
 */
export function maxCallCost(body: { model: string; max_tokens: number; messages: unknown }): number {
  const price = PRICES[body.model] ?? FALLBACK_PRICE;
  return (JSON.stringify(body.messages).length * price.input + body.max_tokens * price.output) / 1e6;
}

/** A request's cost: OpenRouter's own figure, or an estimate from the token counts. */
export function costOf(body: unknown): number {
  const { model, usage } = (body ?? {}) as {
    model?: string;
    usage?: { cost?: number; prompt_tokens?: number; completion_tokens?: number };
  };
  if (typeof usage?.cost === 'number') return usage.cost;
  const price = (model && PRICES[model]) || FALLBACK_PRICE;
  return ((usage?.prompt_tokens ?? 0) * price.input + (usage?.completion_tokens ?? 0) * price.output) / 1e6;
}
