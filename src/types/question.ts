export type QuestionLanguage = 'ar' | 'en';

/** Category names match Open Trivia DB, so Tuesday's internet questions map straight in. */
export type CategoryName =
  | 'General Knowledge'
  | 'Science & Nature'
  | 'Geography'
  | 'History'
  | 'Sports'
  | 'Animals';

/** Raw question shape. Future internet/AI sources must return this same shape. */
export type Question = {
  id: string;
  category: CategoryName;
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
