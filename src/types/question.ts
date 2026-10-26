export type QuestionLanguage = 'ar' | 'en';

/** Raw question shape. Future internet/AI sources must return this same shape. */
export type Question = {
  id: string;
  category: 'General Knowledge';
  language: QuestionLanguage;
  question: string;
  correctAnswer: string;
  incorrectAnswers: [string, string, string];
};

export type AnswerOption = {
  /** Stable ID, independent of display position. */
  id: string;
  text: string;
};

/** A validated question ready for play. Correctness is decided by option ID. */
export type PlayableQuestion = {
  id: string;
  category: Question['category'];
  language: QuestionLanguage;
  question: string;
  options: AnswerOption[];
  correctOptionId: string;
};
