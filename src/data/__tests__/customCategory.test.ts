import { createBoard } from '../../game/board';
import {
  API_BASE,
  canGenerate,
  customQuestionFor,
  CustomCategoryError,
  generateCustom,
  hasCustom,
  loadCustom,
  monthOf,
  nextMonthStart,
  remainingThisMonth,
  type SavedCustom,
} from '../customCategory';

const OCT = new Date(2026, 9, 30);
const NOV = new Date(2026, 10, 2);

/** An in-memory storage, so each test starts clean. */
function memory(initial?: SavedCustom) {
  const items = new Map<string, string>();
  if (initial) items.set('custom-category-v1', JSON.stringify(initial));
  return {
    items,
    getItem: async (k: string) => items.get(k) ?? null,
    setItem: async (k: string, v: string) => {
      items.set(k, v);
    },
  };
}

const five = (['easy', 'easy', 'medium', 'medium', 'hard'] as const).map((difficulty, i) => ({
  id: `c-${i}`,
  category: 'Custom' as const,
  difficulty,
  question: `سؤال ${i}؟`,
  correctAnswer: `صح ${i}`,
  incorrectAnswers: [`أ ${i}`, `ب ${i}`, `ج ${i}`] as [string, string, string],
}));

function replying(status: number, body: unknown) {
  const calls: { url: string; body: string }[] = [];
  const impl = (async (url: string, init?: RequestInit) => {
    calls.push({ url, body: String(init?.body) });
    return { ok: status < 300, status, json: async () => body } as Response;
  }) as unknown as typeof fetch;
  return { impl, calls };
}

describe('«صمم فئتك» on the device', () => {
  it('starts empty with the full five questions for the month', async () => {
    const saved = await loadCustom(OCT, memory());
    expect(saved).toEqual({ month: '2026-10', used: 0, topic: null, questions: [] });
    expect(remainingThisMonth(saved)).toBe(5);
    expect(canGenerate(saved)).toBe(true);
    expect(hasCustom(saved)).toBe(false);
  });

  it('generates five questions, saves them and uses up the month', async () => {
    const storage = memory();
    const { impl, calls } = replying(200, { topic: 'الفضاء', questions: five });
    const saved = await generateCustom('الفضاء', await loadCustom(OCT, storage), { fetchImpl: impl, storage, now: OCT });

    expect(calls[0].url).toBe(`${API_BASE}/api/custom-category`);
    expect(JSON.parse(calls[0].body)).toEqual({ topic: 'الفضاء' });
    expect(saved.used).toBe(5);
    expect(hasCustom(saved)).toBe(true);
    expect(canGenerate(saved)).toBe(false);
    // Saved on the device: loading again gives the same category.
    expect(await loadCustom(OCT, storage)).toEqual(saved);
  });

  it('refuses a sixth question this month without calling the server', async () => {
    const used: SavedCustom = { month: '2026-10', used: 5, topic: 'الفضاء', questions: five };
    const { impl, calls } = replying(200, {});
    await expect(generateCustom('بحر', used, { fetchImpl: impl, storage: memory(), now: OCT })).rejects.toMatchObject({
      kind: 'limit',
    });
    expect(calls).toHaveLength(0);
  });

  it('gives five questions again next month, and keeps the old category playable', async () => {
    const saved = await loadCustom(NOV, memory({ month: '2026-10', used: 5, topic: 'الفضاء', questions: five }));
    expect(saved.month).toBe('2026-11');
    expect(remainingThisMonth(saved)).toBe(5);
    expect(saved.topic).toBe('الفضاء');
    expect(monthOf(OCT)).toBe('2026-10');
    expect(nextMonthStart(OCT)).toEqual(new Date(2026, 10, 1));
  });

  it.each([
    [422, 'bad-topic', 'bad-topic'],
    [400, 'invalid-topic', 'invalid-topic'],
    [502, 'not-enough', 'not-enough'],
    [429, 'rate-limit', 'rate-limit'],
    [503, 'not-configured', 'unavailable'],
  ])('maps HTTP %i {error: %s} to %s, and counts nothing', async (status, error, kind) => {
    const storage = memory();
    const { impl } = replying(status, { error });
    const before = await loadCustom(OCT, storage);
    await expect(generateCustom('الفضاء', before, { fetchImpl: impl, storage, now: OCT })).rejects.toBeInstanceOf(
      CustomCategoryError,
    );
    await expect(generateCustom('الفضاء', before, { fetchImpl: impl, storage, now: OCT })).rejects.toMatchObject({ kind });
    expect((await loadCustom(OCT, storage)).used).toBe(0);
  });

  it('gives each tile of the custom column its own question at the right level', () => {
    const saved: SavedCustom = { month: '2026-10', used: 5, topic: 'الفضاء', questions: five };
    const board = createBoard(['Custom', 'History', 'Geography', 'Sports', 'Art', 'Animals'], ['أ', 'ب']);
    const texts = board.tiles
      .filter((t) => t.category === 'Custom')
      .map((t) => customQuestionFor(t, saved)?.question);
    expect(texts).toEqual(['سؤال 0؟', 'سؤال 1؟', 'سؤال 2؟', 'سؤال 3؟', 'سؤال 4؟']);
  });
});

describe('custom questions on the board', () => {
  it('shuffles the answers, so the right one is not always first', () => {
    const saved: SavedCustom = { month: '2026-10', used: 5, topic: 'الفضاء', questions: five };
    const tile = createBoard(['Custom', 'History', 'Geography', 'Sports', 'Art', 'Animals'], ['أ', 'ب']).tiles[0];
    const firsts = new Set(
      Array.from({ length: 30 }, (_, i) => {
        const q = customQuestionFor(tile, saved, () => (i % 7) / 7)!;
        return q.options[0].id === q.correctOptionId;
      }),
    );
    expect(firsts).toEqual(new Set([true, false]));
  });
});
