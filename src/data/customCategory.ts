import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Tile } from '../game/board';
import { prepareSession, type RandomSource } from '../game/shuffle';
import type { BankQuestion, PlayableQuestion } from '../types/question';
import { toPlayableQuestion } from './getLocalQuestions';

/**
 * «صمم فئتك» on the device: the player's topic, its five AI questions and how many questions
 * this device has generated this month (at most MONTHLY_LIMIT). Kept in AsyncStorage, so
 * the category can be played again until the player designs a new one.
 */
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'https://trivia-app-phi-two.vercel.app';
export const MONTHLY_LIMIT = 5;
export const CUSTOM_QUESTIONS = 5;
export const GENERATE_TIMEOUT_MS = 70_000;
const STORAGE_KEY = 'custom-category-v1';

export type SavedCustom = {
  /** «2026-10»: the month `used` counts in. */
  month: string;
  used: number;
  topic: string | null;
  questions: BankQuestion[];
};

export type CustomErrorKind =
  | 'limit'
  | 'network'
  | 'timeout'
  | 'bad-topic'
  | 'invalid-topic'
  | 'not-enough'
  | 'rate-limit'
  | 'unavailable';

export class CustomCategoryError extends Error {
  constructor(readonly kind: CustomErrorKind) {
    super(`custom category: ${kind}`);
    this.name = 'CustomCategoryError';
  }
}

type Storage = Pick<typeof AsyncStorage, 'getItem' | 'setItem'>;

export const monthOf = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

/** The first day of next month, for «تقدر تصمم فئة جديدة من …». */
export const nextMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 1);

export const remainingThisMonth = (saved: SavedCustom) => Math.max(0, MONTHLY_LIMIT - saved.used);
export const canGenerate = (saved: SavedCustom) => remainingThisMonth(saved) >= CUSTOM_QUESTIONS;
export const hasCustom = (saved: SavedCustom) => saved.topic !== null && saved.questions.length === CUSTOM_QUESTIONS;

/** The saved category; in a new month the count starts again but the category is kept. */
export async function loadCustom(now = new Date(), storage: Storage = AsyncStorage): Promise<SavedCustom> {
  const empty: SavedCustom = { month: monthOf(now), used: 0, topic: null, questions: [] };
  let saved: SavedCustom | null = null;
  try {
    const raw = await storage.getItem(STORAGE_KEY);
    saved = raw ? (JSON.parse(raw) as SavedCustom) : null;
  } catch {
    // Unreadable storage: start fresh.
  }
  if (!saved || typeof saved.used !== 'number' || !Array.isArray(saved.questions)) return empty;
  return saved.month === monthOf(now) ? saved : { ...saved, month: monthOf(now), used: 0 };
}

const SERVER_ERRORS: Record<string, CustomErrorKind> = {
  'bad-topic': 'bad-topic',
  'invalid-topic': 'invalid-topic',
  'not-enough': 'not-enough',
  'rate-limit': 'rate-limit',
};

/**
 * Generates five questions for `topic` and saves them, counting them against this month.
 * Refuses before calling the server once the month's questions are used up.
 */
export async function generateCustom(
  topic: string,
  saved: SavedCustom,
  {
    fetchImpl = fetch,
    storage = AsyncStorage,
    now = new Date(),
    timeoutMs = GENERATE_TIMEOUT_MS,
  }: { fetchImpl?: typeof fetch; storage?: Storage; now?: Date; timeoutMs?: number } = {},
): Promise<SavedCustom> {
  if (!canGenerate(saved)) throw new CustomCategoryError('limit');

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  let res: Response;
  try {
    res = await fetchImpl(`${API_BASE}/api/custom-category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
      signal: controller.signal,
    });
  } catch {
    throw new CustomCategoryError(timedOut ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }

  let body: { topic?: string; questions?: unknown; error?: string } = {};
  try {
    body = await res.json();
  } catch {
    // handled below
  }
  if (!res.ok) throw new CustomCategoryError(SERVER_ERRORS[body.error ?? ''] ?? 'unavailable');

  // Re-validated on the device, as five playable questions.
  const questions = (Array.isArray(body.questions) ? body.questions : []).filter((raw): raw is BankQuestion => {
    try {
      toPlayableQuestion({ ...(raw as BankQuestion), language: 'ar' });
      return true;
    } catch {
      return false;
    }
  });
  if (questions.length !== CUSTOM_QUESTIONS) throw new CustomCategoryError('not-enough');

  const next: SavedCustom = {
    month: monthOf(now),
    used: saved.used + questions.length,
    topic: body.topic ?? topic,
    questions: questions.map((q) => ({ ...q, category: 'Custom' })),
  };
  try {
    await storage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Still playable this session even if it cannot be saved.
  }
  return next;
}

/**
 * The question for a tile of the custom column: rows 0–1 are the two easy ones, 2–3 the
 * medium ones and 4 the hard one, in the order the server returned them. Answers are shuffled.
 */
export function customQuestionFor(
  tile: Tile,
  saved: SavedCustom,
  random: RandomSource = Math.random,
): PlayableQuestion | undefined {
  const row = Number(tile.id.split('|')[1]);
  const sameLevel = saved.questions.filter((q) => q.difficulty === tile.difficulty);
  const index = tile.difficulty === 'easy' ? row : tile.difficulty === 'medium' ? row - 2 : 0;
  const raw = sameLevel[index];
  if (!raw) return undefined;
  return prepareSession([toPlayableQuestion({ ...raw, id: `custom-${row}-${raw.id}`, language: 'ar' })], random, 1)[0];
}
