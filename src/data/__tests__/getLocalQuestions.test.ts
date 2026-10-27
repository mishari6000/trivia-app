import type { Question } from '../../types/question';
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
  it('returns exactly ten valid General Knowledge questions with unique IDs', () => {
    const questions = getLocalQuestions();
    expect(questions).toHaveLength(10);
    expect(new Set(questions.map((q) => q.id)).size).toBe(10);

    questions.forEach((q) => {
      expect(q.category).toBe('General Knowledge');
      expect(q.question.length).toBeGreaterThan(0);
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options.map((o) => o.id)).size).toBe(4);
      expect(new Set(q.options.map((o) => o.text)).size).toBe(4);
      expect(q.options.filter((o) => o.id === q.correctOptionId)).toHaveLength(1);
    });
  });

  it('rejects empty content', () => {
    expect(() => toPlayableQuestion({ ...base, question: '  ' })).toThrow();
    expect(() => toPlayableQuestion({ ...base, incorrectAnswers: ['ب', '', 'د'] })).toThrow();
  });

  it('rejects duplicate answers after normalization', () => {
    expect(() => toPlayableQuestion({ ...base, incorrectAnswers: [' أ ', 'ج', 'د'] })).toThrow();
  });
});
