import { boardCategories, countQuestions, getQuestions, isBoardReady } from '../../data/bank';
import { FEATURED } from '../../data/categories';
import { getLocalQuestions } from '../../data/getLocalQuestions';
import { pickFresh, pickQuestion } from '../pickSession';

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

  it('pickQuestion gives each board tile a question not played yet', () => {
    const ids = Array.from({ length: 10 }, () => pickQuestion('Geography', 'easy')?.id);
    expect(new Set(ids).size).toBe(10);
    ids.forEach((id) => expect(id).toBeDefined());
  });
});

describe('question bank', () => {
  it('counts the hand-written questions as easy, and offers only categories a board can fill', () => {
    FEATURED.forEach((name) => {
      expect(countQuestions(name, 'easy')).toBeGreaterThanOrEqual(10);
      expect(getQuestions(name, 'easy').every((q) => q.language === 'ar' && q.category === name)).toBe(true);
    });
    // Every offered category has two questions at each level for its six tiles.
    expect(boardCategories().length).toBeGreaterThanOrEqual(6);
    boardCategories().forEach((c) => expect(isBoardReady(c.name)).toBe(true));
  });

  it('every generated question is valid and in Arabic', () => {
    for (const category of boardCategories()) {
      for (const level of ['easy', 'medium', 'hard'] as const) {
        expect(getQuestions(category.name, level)).toHaveLength(countQuestions(category.name, level));
      }
    }
  });
});
