import { categoriesFor } from '../../src/data/categories';
import { toPlayableQuestion } from '../../src/data/getLocalQuestions';
import {
  BUDGET_USD,
  buildRequestBody,
  CATEGORY_TOPICS,
  isCategory,
  MODELS,
  parseGenerated,
  usageFromKeyResponse,
} from '../aiQuestions';

const q = (question: string, correctAnswer: string, incorrectAnswers: unknown) => ({
  question,
  correctAnswer,
  incorrectAnswers,
});

describe('AI question generation (server)', () => {
  it('knows every app category and nothing else', () => {
    expect(Object.keys(CATEGORY_TOPICS).sort()).toEqual(categoriesFor('online').map((c) => c.name).sort());
    expect(isCategory('Geography')).toBe(true);
    expect(isCategory('hack the planet')).toBe(false);
    expect(isCategory(42)).toBe(false);
    expect(isCategory('__proto__')).toBe(false);
  });

  it('asks for strict JSON in Arabic, with a fallback model and a $5 cap', () => {
    const body = buildRequestBody('History', 8);
    expect(body.models).toEqual(MODELS);
    expect(body.models.length).toBeGreaterThan(1);
    expect(body.response_format.type).toBe('json_schema');
    expect(body.response_format.json_schema.strict).toBe(true);
    expect(body.provider.require_parameters).toBe(true);
    expect(body.messages[1].content).toContain('تاريخ');
    expect(body.messages[1].content).toContain('8');
    expect(BUDGET_USD).toBe(5);
  });

  it('keeps only well-formed questions and maps them to the app shape', () => {
    const content = JSON.stringify({
      questions: [
        q('ما هي عاصمة اليابان؟', 'طوكيو', ['أوساكا', 'كيوتو', 'سيول']),
        q('سؤال مكرر الإجابات؟', 'أ', ['أ', 'ب', 'ج']), // duplicate answers
        q('سؤال ناقص؟', 'أ', ['ب', 'ج']), // only two wrong answers
        q('', 'أ', ['ب', 'ج', 'د']), // empty question
        q('ما هي عاصمة اليابان؟', 'طوكيو', ['أوساكا', 'كيوتو', 'سيول']), // repeated question
        q('سؤال بأرقام؟', 'أ', ['ب', 'ج', 3]), // non-string answer
      ],
    });
    const out = parseGenerated(content, 'Geography');
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      category: 'Geography',
      language: 'ar',
      question: 'ما هي عاصمة اليابان؟',
      correctAnswer: 'طوكيو',
      incorrectAnswers: ['أوساكا', 'كيوتو', 'سيول'],
    });
    // The app's own validation accepts what the server sends.
    expect(() => toPlayableQuestion(out[0])).not.toThrow();
  });

  it('returns nothing for broken output instead of throwing', () => {
    expect(parseGenerated('not json', 'Art')).toEqual([]);
    expect(parseGenerated('{"questions": "nope"}', 'Art')).toEqual([]);
    expect(parseGenerated('null', 'Art')).toEqual([]);
  });

  it('reads the spent amount from the key endpoint', () => {
    expect(usageFromKeyResponse({ data: { usage: 1.25, limit: 5 } })).toBe(1.25);
    expect(usageFromKeyResponse({})).toBeNull();
  });
});
