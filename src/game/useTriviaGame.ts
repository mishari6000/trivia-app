import { useCallback, useReducer } from 'react';

import { getLocalQuestions } from '../data/getLocalQuestions';
import { createInitialState, gameReducer } from './gameReducer';
import { prepareSession } from './shuffle';

/** A fresh session: answer orders are shuffled once here, never during rendering. */
const newSession = () => prepareSession(getLocalQuestions());

export function useTriviaGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createInitialState(newSession()),
  );

  const answer = useCallback((optionId: string) => dispatch({ type: 'answer', optionId }), []);
  const next = useCallback(() => dispatch({ type: 'next' }), []);
  const restart = useCallback(() => dispatch({ type: 'restart', questions: newSession() }), []);

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
