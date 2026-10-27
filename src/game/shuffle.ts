import type { PlayableQuestion } from '../types/question';

/** Returns a number in [0, 1). Injectable so tests can control randomness. */
export type RandomSource = () => number;

/** Unbiased Fisher–Yates shuffle. Returns a new array; the input is never mutated. */
export function shuffle<T>(items: readonly T[], random: RandomSource = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Prepares a game session: each question gets its answer order shuffled once.
 * The stored order stays fixed for the whole game; correctness still uses option IDs.
 */
export function prepareSession(
  questions: readonly PlayableQuestion[],
  random: RandomSource = Math.random,
): PlayableQuestion[] {
  return questions.map((question) => ({
    ...question,
    options: shuffle(question.options, random),
  }));
}
