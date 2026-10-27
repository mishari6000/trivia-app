import type { PlayableQuestion } from '../types/question';
import { shuffle, type RandomSource } from './shuffle';

/** Picks two wrong options to remove; the correct answer and one wrong answer remain. */
export function pickFiftyFiftyRemovals(
  question: PlayableQuestion,
  random: RandomSource = Math.random,
): string[] {
  const wrongIds = question.options
    .filter((o) => o.id !== question.correctOptionId)
    .map((o) => o.id);
  return shuffle(wrongIds, random).slice(0, 2);
}
