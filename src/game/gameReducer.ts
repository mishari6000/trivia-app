import type { PlayableQuestion } from '../types/question';

export type GamePhase = 'answering' | 'feedback' | 'results';

export type GameState = {
  questions: PlayableQuestion[];
  phase: GamePhase;
  currentIndex: number;
  score: number;
  selectedOptionId: string | null;
  lastAnswerCorrect: boolean | null;
};

export type GameAction =
  | { type: 'answer'; optionId: string }
  | { type: 'next' }
  | { type: 'restart'; questions: PlayableQuestion[] };

export function createInitialState(questions: PlayableQuestion[]): GameState {
  return {
    questions,
    phase: 'answering',
    currentIndex: 0,
    score: 0,
    selectedOptionId: null,
    lastAnswerCorrect: null,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'answer': {
      // Only the first answer per question counts; later taps are ignored.
      if (state.phase !== 'answering') return state;
      const question = state.questions[state.currentIndex];
      if (!question || !question.options.some((o) => o.id === action.optionId)) return state;

      const isCorrect = action.optionId === question.correctOptionId;
      return {
        ...state,
        phase: 'feedback',
        selectedOptionId: action.optionId,
        lastAnswerCorrect: isCorrect,
        score: isCorrect ? state.score + 1 : state.score,
      };
    }
    case 'next': {
      if (state.phase !== 'feedback') return state;
      const isLast = state.currentIndex >= state.questions.length - 1;
      if (isLast) return { ...state, phase: 'results' };
      return {
        ...state,
        phase: 'answering',
        currentIndex: state.currentIndex + 1,
        selectedOptionId: null,
        lastAnswerCorrect: null,
      };
    }
    case 'restart':
      return createInitialState(action.questions);
    default:
      return state;
  }
}
