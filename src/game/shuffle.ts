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

export const QUESTIONS_PER_GAME = 5;

/**
 * Prepares a game session once (on Start / Play again): picks `size` unique questions
 * at random from the bank and shuffles each one's answers. The stored session stays
 * fixed for the whole game; correctness still uses option IDs.
 */
export function prepareSession(
  bank: readonly PlayableQuestion[],
  random: RandomSource = Math.random,
  size: number = QUESTIONS_PER_GAME,
): PlayableQuestion[] {
  return shuffle(bank, random)
    .slice(0, size)
    .map((question) => ({
      ...question,
      options: shuffle(question.options, random),
    }));
}
