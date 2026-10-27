import { categoriesFor } from '../../data/categories';
import { getLocalQuestions } from '../../data/getLocalQuestions';
import { questions as questionBank } from '../../data/questions';
import { createInitialState, gameReducer } from '../gameReducer';
import { prepareSession, QUESTIONS_PER_GAME, shuffle, type RandomSource } from '../shuffle';

// A moment well inside the first question's 15-second window.
const T = 1000;

/** Deterministic random source (mulberry32) so tests never depend on luck. */
function seeded(seed: number): RandomSource {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sorted = <T>(items: T[]) => [...items].sort();

describe('shuffle', () => {
  it('returns a permutation and leaves the input untouched', () => {
    const input = ['a', 'b', 'c', 'd'];
    for (let seed = 1; seed <= 50; seed++) {
      const result = shuffle(input, seeded(seed));
      expect(sorted(result)).toEqual(input);
      expect(input).toEqual(['a', 'b', 'c', 'd']);
    }
  });

  it('follows Fisher-Yates exactly for a controlled random source', () => {
    // random() = 0 always swaps with index 0: [a,b,c,d] -> [b,c,d,a]
    expect(shuffle(['a', 'b', 'c', 'd'], () => 0)).toEqual(['b', 'c', 'd', 'a']);
    // random() close to 1 always swaps an item with itself: order unchanged.
    expect(shuffle(['a', 'b', 'c', 'd'], () => 0.999)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('can produce all 24 orders of four answers', () => {
    const seen = new Set<string>();
    const random = seeded(42);
    for (let i = 0; i < 2000; i++) seen.add(shuffle(['a', 'b', 'c', 'd'], random).join(''));
    expect(seen.size).toBe(24);
  });
});

describe('prepareSession', () => {
  it('keeps four unique options and the correct answer identity', () => {
    const source = getLocalQuestions();
    const session = prepareSession(source, seeded(7));

    session.forEach((question) => {
      const original = source.find((q) => q.id === question.id)!;
      const raw = questionBank.find((q) => q.id === question.id)!;
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map((o) => o.id)).size).toBe(4);
      expect(sorted(question.options.map((o) => o.id))).toEqual(
        sorted(original.options.map((o) => o.id)),
      );
      expect(question.correctOptionId).toBe(original.correctOptionId);
      const correct = question.options.find((o) => o.id === question.correctOptionId);
      expect(correct?.text).toBe(raw.correctAnswer);
    });
  });

  it('picks five unique questions from the chosen category only', () => {
    categoriesFor('local').forEach(({ name }) => {
      const categoryIds = new Set(questionBank.filter((q) => q.category === name).map((q) => q.id));
      for (let seed = 1; seed <= 20; seed++) {
        const session = prepareSession(getLocalQuestions(name), seeded(seed));
        const ids = session.map((q) => q.id);
        expect(ids).toHaveLength(QUESTIONS_PER_GAME);
        expect(new Set(ids).size).toBe(QUESTIONS_PER_GAME);
        ids.forEach((id) => expect(categoryIds.has(id)).toBe(true));
        session.forEach((q) => expect(q.category).toBe(name));
      }
    });
  });

  it('uses every question of a category across sessions and varies the selection', () => {
    const random = seeded(11);
    categoriesFor('local').forEach(({ name }) => {
      const used = new Set<string>();
      const selections = new Set<string>();
      for (let i = 0; i < 200; i++) {
        const ids = prepareSession(getLocalQuestions(name), random).map((q) => q.id);
        ids.forEach((id) => used.add(id));
        selections.add([...ids].sort().join(','));
      }
      expect(used.size).toBe(10);
      expect(selections.size).toBeGreaterThan(1);
    });
  });

  it('does not mutate the question bank or the source questions', () => {
    const bankBefore = JSON.parse(JSON.stringify(questionBank));
    const source = getLocalQuestions();
    const sourceBefore = JSON.parse(JSON.stringify(source));

    prepareSession(source, () => 0);

    expect(questionBank).toEqual(bankBefore);
    expect(source).toEqual(sourceBefore);
  });

  it('keeps the answer order stable while the game is played', () => {
    const session = prepareSession(getLocalQuestions(), seeded(3));
    const order = (s: ReturnType<typeof createInitialState>) =>
      s.questions.map((q) => q.options.map((o) => o.id).join(','));

    let state = createInitialState(session);
    const initialOrder = order(state);
    for (let i = 0; i < session.length; i++) {
      const q = state.questions[state.currentIndex];
      state = gameReducer(state, { type: 'answer', now: T, optionId: q.options[0].id });
      expect(order(state)).toEqual(initialOrder);
      state = gameReducer(state, { type: 'next', now: T });
      expect(order(state)).toEqual(initialOrder);
    }
    expect(state.phase).toBe('results');
  });
});
