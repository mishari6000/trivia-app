import type { Question } from '../../types/question';
import { categoriesFor, getCategory } from '../categories';
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
    categoriesFor('local').forEach(({ name }) => {
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
    expect(all).toHaveLength(categoriesFor('local').length * 10);
    expect(new Set(all.map((q) => q.id)).size).toBe(all.length);
    expect(new Set(all.map((q) => q.category))).toEqual(new Set(categoriesFor('local').map((c) => c.name)));
  });

  it('lists all 24 Open Trivia DB categories with unique ids, local ones included', () => {
    const all = categoriesFor('online');
    expect(all).toHaveLength(24);
    expect(new Set(all.map((c) => c.openTriviaId)).size).toBe(24);
    expect(all.map((c) => c.openTriviaId)).toEqual(Array.from({ length: 24 }, (_, i) => 9 + i));
    categoriesFor('local').forEach((c) => expect(all).toContain(c));
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
