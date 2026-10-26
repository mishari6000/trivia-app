import { useCallback, useReducer } from 'react';

import { getLocalQuestions } from '../data/getLocalQuestions';
import { createInitialState, gameReducer } from './gameReducer';

export function useTriviaGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createInitialState(getLocalQuestions()),
  );

  const answer = useCallback((optionId: string) => dispatch({ type: 'answer', optionId }), []);
  const next = useCallback(() => dispatch({ type: 'next' }), []);
  const restart = useCallback(
    () => dispatch({ type: 'restart', questions: getLocalQuestions() }),
    [],
  );

  return {
    state,
    currentQuestion: state.questions[state.currentIndex],
    totalQuestions: state.questions.length,
    isLastQuestion: state.currentIndex === state.questions.length - 1,
    answer,
    next,
    restart,
  };
}
