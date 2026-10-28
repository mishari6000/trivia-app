import type { Bank, CategoryName, Difficulty, PlayableQuestion, Question } from '../types/question';
import { categories, FEATURED, getCategory, type Category } from './categories';
import { toPlayableQuestion } from './getLocalQuestions';
import { questions as handWritten } from './questions';
import bankFile from './bank.json';

/**
 * Every question the app ships with, all Arabic: the hand-written ones (counted as easy) and
 * the generated bank (src/data/bank.json, made by scripts/generate-questions.mts with
 * OpenRouter and fact-checked). Nothing is fetched while playing.
 */
const generated = (bankFile as unknown as Bank).questions;

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = { easy: 'سهل', medium: 'متوسط', hard: 'صعب' };

type Entry = Question & { difficulty: Difficulty };
const entries: Entry[] = [
  ...handWritten.map((q) => ({ ...q, difficulty: 'easy' as const })),
  ...generated.map((q) => ({ ...q, language: 'ar' as const })),
];

const keyOf = (category: CategoryName, difficulty: Difficulty) => `${category}|${difficulty}`;

const counts = new Map<string, number>();
for (const q of entries) counts.set(keyOf(q.category, q.difficulty), (counts.get(keyOf(q.category, q.difficulty)) ?? 0) + 1);

/** How many questions a category has at one level, or at all levels. */
export function countQuestions(category: CategoryName, difficulty?: Difficulty): number {
  const levels = difficulty ? [difficulty] : DIFFICULTIES;
  return levels.reduce((sum, d) => sum + (counts.get(keyOf(category, d)) ?? 0), 0);
}

/** Questions a category needs at each level for one board: two tiles per level. */
export const BOARD_QUESTIONS_PER_LEVEL = 2;

/** A category can go on the board once every level has enough questions. */
export const isBoardReady = (category: CategoryName) =>
  DIFFICULTIES.every((d) => countQuestions(category, d) >= BOARD_QUESTIONS_PER_LEVEL);

/** Categories that can go on a board, featured ones first. */
export function boardCategories(): Category[] {
  const ordered = [...FEATURED.map(getCategory), ...categories.filter((c) => !FEATURED.includes(c.name))];
  return ordered.filter((c) => isBoardReady(c.name));
}

// Validated lazily, one category and level at a time, so a big bank never slows the start.
const validated = new Map<string, PlayableQuestion[]>();

/** Validated questions for one category and level; malformed entries are skipped. */
export function getQuestions(category: CategoryName, difficulty: Difficulty): PlayableQuestion[] {
  const key = keyOf(category, difficulty);
  let list = validated.get(key);
  if (!list) {
    list = [];
    for (const q of entries) {
      if (q.category !== category || q.difficulty !== difficulty) continue;
      try {
        list.push(toPlayableQuestion(q));
      } catch {
        // skip
      }
    }
    validated.set(key, list);
  }
  return list;
}
