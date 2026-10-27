import { resetRateLimit } from '../../data/openTrivia';
import { loadSession } from '../loadSession';

const enc = encodeURIComponent;
const results = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    type: 'multiple',
    question: enc(`Question ${i}?`),
    correct_answer: enc(`Right ${i}`),
    incorrect_answers: [enc(`Wrong ${i}a`), enc(`Wrong ${i}b`), enc(`Wrong ${i}c`)],
  }));
const fetchReturning = (body: object) =>
  (async () => ({ ok: true, status: 200, json: async () => body }) as Response) as unknown as typeof fetch;
const noSleep = async () => {};

beforeEach(() => resetRateLimit());

describe('loadSession', () => {
  it('local: five Arabic questions from the chosen category', async () => {
    const session = await loadSession('Geography', 'local');
    expect(session).toHaveLength(5);
    session.forEach((q) => {
      expect(q.category).toBe('Geography');
      expect(q.language).toBe('ar');
    });
  });

  it('online: five unique English questions with four shuffled options each', async () => {
    const session = await loadSession('Entertainment: Film', 'online', {
      fetchImpl: fetchReturning({ response_code: 0, results: results(10) }),
      sleep: noSleep,
    });
    expect(session).toHaveLength(5);
    expect(new Set(session.map((q) => q.id)).size).toBe(5);
    session.forEach((q) => {
      expect(q.language).toBe('en');
      expect(q.category).toBe('Entertainment: Film');
      expect(q.options).toHaveLength(4);
      expect(q.options.some((o) => o.id === q.correctOptionId)).toBe(true);
    });
  });

  it('online: fails clearly when too few usable questions come back', async () => {
    await expect(
      loadSession('Art', 'online', {
        fetchImpl: fetchReturning({ response_code: 0, results: results(3) }),
        sleep: noSleep,
      }),
    ).rejects.toMatchObject({ kind: 'no-results' });
  });
});
