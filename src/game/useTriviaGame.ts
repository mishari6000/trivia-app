import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { getLocalQuestions } from '../data/getLocalQuestions';
import type { CategoryName } from '../types/question';
import { pickFiftyFiftyRemovals } from './fiftyFifty';
import {
  createInitialState,
  gameReducer,
  getRemainingMs,
  QUESTION_TIME_MS,
  TIMEOUT_ADVANCE_MS,
} from './gameReducer';
import { prepareSession } from './shuffle';

/** A fresh session: questions and answer orders are picked once here, never during rendering. */
const newSession = (category: CategoryName) => prepareSession(getLocalQuestions(category));

/** How often the countdown display refreshes. Resolution itself is deadline-based. */
const TICK_MS = 200;

export function useTriviaGame(category: CategoryName) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createInitialState(newSession(category), Date.now()),
  );
  const [now, setNow] = useState(() => Date.now());
  const [isAppActive, setAppActive] = useState(AppState.currentState !== 'background');

  // Latest question identity for the AppState listener, which outlives renders.
  const questionRef = useRef({ sessionId: state.sessionId, index: state.currentIndex });
  const { phase, deadline, timedOut, sessionId, currentIndex } = state;
  useEffect(() => {
    questionRef.current = { sessionId, index: currentIndex };
  }, [sessionId, currentIndex]);

  // Countdown display + the deadline timeout, only while a question is open and visible.
  useEffect(() => {
    if (phase !== 'answering' || !isAppActive) return;
    const tick = setInterval(() => setNow(Date.now()), TICK_MS);
    const expire = setTimeout(
      () => dispatch({ type: 'timeout', now: Date.now(), sessionId, index: currentIndex }),
      Math.max(0, deadline - Date.now()) + 20,
    );
    return () => {
      clearInterval(tick);
      clearTimeout(expire);
    };
  }, [phase, deadline, isAppActive, sessionId, currentIndex]);

  // After a timeout, move on automatically. Paused while the app is in the background,
  // so unseen questions never start their clock.
  useEffect(() => {
    if (phase !== 'feedback' || !timedOut || !isAppActive) return;
    const advance = setTimeout(
      () => dispatch({ type: 'advance', now: Date.now(), sessionId, index: currentIndex }),
      TIMEOUT_ADVANCE_MS,
    );
    return () => clearTimeout(advance);
  }, [phase, timedOut, isAppActive, sessionId, currentIndex]);

  // The deadline keeps running in the background; on return, reconcile once.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      const active = next === 'active';
      setAppActive(active);
      if (active) {
        dispatch({ type: 'timeout', now: Date.now(), ...questionRef.current });
      }
    });
    return () => subscription.remove();
  }, []);

  const answer = useCallback(
    (optionId: string) => dispatch({ type: 'answer', optionId, now: Date.now() }),
    [],
  );
  const next = useCallback(() => dispatch({ type: 'next', now: Date.now() }), []);
  const restart = useCallback(
    () => dispatch({ type: 'restart', questions: newSession(category), now: Date.now() }),
    [category],
  );
  const currentQuestion = state.questions[state.currentIndex];
  const applyFiftyFifty = useCallback(() => {
    if (!currentQuestion) return;
    dispatch({
      type: 'fiftyFifty',
      removeIds: pickFiftyFiftyRemovals(currentQuestion),
      now: Date.now(),
    });
  }, [currentQuestion]);

  return {
    state,
    currentQuestion,
    totalQuestions: state.questions.length,
    isLastQuestion: state.currentIndex === state.questions.length - 1,
    remainingMs: getRemainingMs(state, now),
    totalMs: QUESTION_TIME_MS,
    canUseFiftyFifty:
      state.phase === 'answering' && !state.lifelineUsed && now < state.deadline,
    answer,
    next,
    restart,
    applyFiftyFifty,
  };
}
