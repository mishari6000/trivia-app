import { getQuestions } from '../data/bank';
import type { CategoryName, Difficulty, PlayableQuestion } from '../types/question';
import { prepareSession, QUESTIONS_PER_GAME, shuffle, type RandomSource } from './shuffle';

/**
 * Picks a game that avoids questions already seen, so every game is different. `seen` is
 * updated in place. Once fewer than a game's worth are unseen, the cycle starts again
 * (still never repeating a question from the game that just ended).
 */
export function pickFresh(
  bank: readonly PlayableQuestion[],
  seen: Set<string>,
  random: RandomSource = Math.random,
  size: number = QUESTIONS_PER_GAME,
): PlayableQuestion[] {
  const fresh = bank.filter((q) => !seen.has(q.id));
  let session = prepareSession(fresh, random, Math.min(size, fresh.length));
  if (session.length < size) {
    const taken = new Set(session.map((q) => q.id));
    // A Set keeps insertion order, so the last `size` ids are the game that just ended.
    const lastGame = new Set([...seen].slice(-size));
    seen.clear();
    const pool = bank.filter((q) => !taken.has(q.id));
    const notLast = pool.filter((q) => !lastGame.has(q.id));
    const rest = prepareSession(
      notLast.length >= size - session.length ? notLast : pool,
      random,
      size - session.length,
    );
    session = shuffle([...session, ...rest], random);
  }
  session.forEach((q) => seen.add(q.id));
  return session;
}

/** Questions already played, per category and level, for as long as the app is open. */
const seenByLevel = new Map<string, Set<string>>();

/** A fresh question for one board tile, never one already played while the app is open. */
export function pickQuestion(category: CategoryName, difficulty: Difficulty): PlayableQuestion | undefined {
  const key = `${category}|${difficulty}`;
  const seen = seenByLevel.get(key) ?? new Set<string>();
  seenByLevel.set(key, seen);
  return pickFresh(getQuestions(category, difficulty), seen, Math.random, 1)[0];
}
