import type { Question } from '../../types/question';
import { categories, getCategory } from '../categories';
import { getLocalQuestions, toPlayableQuestion } from '../getLocalQuestions';

const base: Question = {
  id: 'q',
  category: 'General Knowledge',
  language: 'ar',
  question: 'سؤال؟',
  correctAnswer: 'أ',
  incorrectAnswers: ['ب', 'ج', 'د'],
};

describe('getLocalQuestions', () => {
  it('has exactly ten valid questions for every category', () => {
    categories.forEach(({ name }) => {
      const questions = getLocalQuestions(name);
      expect(questions).toHaveLength(10);

      questions.forEach((q) => {
        expect(q.category).toBe(name);
        expect(q.question.length).toBeGreaterThan(0);
        expect(q.options).toHaveLength(4);
        expect(new Set(q.options.map((o) => o.id)).size).toBe(4);
        expect(new Set(q.options.map((o) => o.text)).size).toBe(4);
        expect(q.options.filter((o) => o.id === q.correctOptionId)).toHaveLength(1);
      });
    });
  });

  it('uses unique IDs across the whole bank and no category without questions', () => {
    const all = getLocalQuestions();
    expect(all).toHaveLength(categories.length * 10);
    expect(new Set(all.map((q) => q.id)).size).toBe(all.length);
    expect(new Set(all.map((q) => q.category))).toEqual(new Set(categories.map((c) => c.name)));
  });

  it('keeps every category matched to an Open Trivia DB id', () => {
    expect(new Set(categories.map((c) => c.openTriviaId)).size).toBe(categories.length);
    expect(getCategory('General Knowledge').openTriviaId).toBe(9);
  });

  it('rejects empty content', () => {
    expect(() => toPlayableQuestion({ ...base, question: '  ' })).toThrow();
    expect(() => toPlayableQuestion({ ...base, incorrectAnswers: ['ب', '', 'د'] })).toThrow();
  });

  it('rejects duplicate answers after normalization', () => {
    expect(() => toPlayableQuestion({ ...base, incorrectAnswers: [' أ ', 'ج', 'د'] })).toThrow();
  });
});
