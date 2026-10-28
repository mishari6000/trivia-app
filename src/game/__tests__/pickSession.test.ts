import { countQuestions, getQuestions, isPlayable, playableCategories } from '../../data/bank';
import { FEATURED } from '../../data/categories';
import { getLocalQuestions } from '../../data/getLocalQuestions';
import { newGame, pickFresh } from '../pickSession';

describe('picking a game', () => {
  it('never repeats a question until the level runs out, then starts a new cycle', () => {
    const bank = getLocalQuestions('History'); // 10 questions
    const seen = new Set<string>();
    const first = pickFresh(bank, seen).map((q) => q.id);
    const second = pickFresh(bank, seen).map((q) => q.id);
    expect(new Set([...first, ...second]).size).toBe(10);

    // All ten are used: the third game starts over, but not with the game just played.
    const third = pickFresh(bank, seen).map((q) => q.id);
    expect(third).toHaveLength(5);
    expect(new Set(third).size).toBe(5);
    third.forEach((id) => expect(second).not.toContain(id));
  });

  it('fills a game from the new cycle when only a few unseen questions are left', () => {
    const bank = getLocalQuestions('Sports');
    const seen = new Set(bank.slice(0, 8).map((q) => q.id)); // 2 unseen
    const game = pickFresh(bank, seen).map((q) => q.id);
    expect(game).toHaveLength(5);
    expect(game).toContain(bank[8].id);
    expect(game).toContain(bank[9].id);
    expect(seen).toEqual(new Set(game));
  });

  it('newGame gives a different game each time for the same category and level', () => {
    const a = newGame('Geography', 'easy').map((q) => q.id);
    const b = newGame('Geography', 'easy').map((q) => q.id);
    a.forEach((id) => expect(b).not.toContain(id));
  });
});

describe('question bank', () => {
  it('counts the hand-written questions as easy, so the featured six are always playable', () => {
    FEATURED.forEach((name) => {
      expect(countQuestions(name, 'easy')).toBeGreaterThanOrEqual(10);
      expect(isPlayable(name, 'easy')).toBe(true);
      expect(getQuestions(name, 'easy').every((q) => q.language === 'ar' && q.category === name)).toBe(true);
    });
    expect(playableCategories().slice(0, 6).map((c) => c.name)).toEqual(FEATURED);
  });

  it('every generated question is valid and in Arabic', () => {
    for (const category of playableCategories()) {
      for (const level of ['easy', 'medium', 'hard'] as const) {
        expect(getQuestions(category.name, level)).toHaveLength(countQuestions(category.name, level));
      }
    }
  });
});
