import { categories } from '../../src/data/categories';
import { toPlayableQuestion } from '../../src/data/getLocalQuestions';
import {
  applyCheck,
  BUDGET_USD,
  buildCheckRequest,
  buildWriteRequest,
  CATEGORY_NAMES,
  CHECKER_MODEL,
  costOf,
  maxCallCost,
  parseWritten,
  questionId,
  WRITER_MODEL,
} from '../questionGen';

const item = (question: string, correct = 'صح', wrong = ['أ', 'ب', 'ج']) => ({
  question,
  correctAnswer: correct,
  incorrectAnswers: wrong,
});
const written = (...items: object[]) => JSON.stringify({ questions: items });

describe('question generation (offline script)', () => {
  it('covers exactly the app\'s 24 categories', () => {
    expect([...CATEGORY_NAMES].sort()).toEqual(categories.map((c) => c.name).sort());
  });

  it('asks the writer for one level, with a strict schema, and lists what to avoid', () => {
    const body = buildWriteRequest('History', 'hard', ['ما عاصمة الكويت؟']);
    expect(body.model).toBe(WRITER_MODEL);
    // One model, no fallbacks, and no `temperature` (these models reject it, and with
    // require_parameters that silently routed every request to a different model).
    expect(body).not.toHaveProperty('models');
    expect(body).not.toHaveProperty('temperature');
    expect(body.response_format.json_schema.strict).toBe(true);
    expect(body.provider.require_parameters).toBe(true);
    expect(body.messages[0].content).toContain('HARD');
    expect(body.messages[1].content).toContain('«تاريخ»');
    expect(body.messages[1].content).toContain('ما عاصمة الكويت؟');
    // Thinking shares max_tokens and cut answers off: none for writing.
    expect(body.reasoning).toEqual({ effort: 'none' });
    expect(BUDGET_USD).toBe(10);
  });

  it('keeps only well-formed, unambiguous questions, tagged with the level', () => {
    const out = parseWritten(
      written(
        item('ما أكبر محيط؟', 'الهادئ', ['الأطلسي', 'الهندي', 'المتجمد']),
        item('مكرر؟', 'أ', ['أ', 'ب', 'ج']), // repeated answer
        item('ناقص؟', 'أ', ['ب']), // two wrong answers only
        item('ما أكبر محيط؟', 'الهادئ', ['أ', 'ب', 'ج']), // same question again
        { question: 5 },
      ),
      'Geography',
      'easy',
    );
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ category: 'Geography', difficulty: 'easy', correctAnswer: 'الهادئ' });
    expect(() => toPlayableQuestion({ ...out[0], language: 'ar' })).not.toThrow();
    expect(parseWritten('not json', 'Geography', 'easy')).toEqual([]);
  });

  it('gives the same question the same id, whatever its punctuation or hamza', () => {
    expect(questionId('easy', 'ما أكبر محيط؟')).toBe(questionId('easy', 'ما اكبر محيط'));
    expect(questionId('hard', 'ما أكبر محيط؟')).not.toBe(questionId('easy', 'ما أكبر محيط؟'));
  });

  it('keeps only what the checker approved, at about the level asked for', () => {
    const items = parseWritten(written(item('س1؟'), item('س2؟'), item('س3؟'), item('س4؟')), 'Art', 'easy');
    const checkBody = buildCheckRequest(items);
    expect(checkBody.model).toBe(CHECKER_MODEL);
    expect(checkBody).not.toHaveProperty('temperature');
    expect(checkBody.reasoning).toEqual({ effort: 'low' });
    expect(buildCheckRequest(items, 'anthropic/claude-sonnet-5.5').model).toBe('anthropic/claude-sonnet-5.5');
    const verdict = JSON.stringify({
      results: [
        { n: 0, ok: true, level: 'easy' },
        { n: 1, ok: false, level: 'easy' }, // wrong fact
        { n: 2, ok: true, level: 'hard' }, // asked easy, rated hard
        { n: 3, ok: true, level: 'medium' },
        { n: 9, ok: true, level: 'easy' }, // no such question
      ],
    });
    expect(applyCheck(items, verdict)?.map((q) => q.question)).toEqual(['س1؟', 'س4؟']);
    // An unreadable answer is a failed check (null), not «all rejected».
    expect(applyCheck(items, '{')).toBeNull();
    expect(applyCheck(items, '```json\n' + verdict + '\n```')).toHaveLength(2);
  });

  it('counts OpenRouter\'s reported cost, or estimates it from tokens', () => {
    expect(costOf({ usage: { cost: 0.0123 } })).toBe(0.0123);
    expect(
      costOf({ model: 'anthropic/claude-haiku-5.5', usage: { prompt_tokens: 1_000_000, completion_tokens: 1_000_000 } }),
    ).toBeCloseTo(0.6);
    expect(costOf({})).toBe(0);
  });

  it('reserves a worst case at least as high as any real request can cost', () => {
    const body = buildWriteRequest('History', 'easy', Array(200).fill('سؤال طويل نوعًا ما عن التاريخ؟'));
    const worst = maxCallCost(body);
    // Full output at Haiku's output price, plus the prompt.
    expect(worst).toBeGreaterThan((body.max_tokens * 0.5) / 1e6);
    expect(worst).toBeLessThan(0.02);
  });
});
