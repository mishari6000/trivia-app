import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { AppState } from 'react-native';

import type { PlayableQuestion } from '../types/question';
import { pickFiftyFiftyRemovals } from './fiftyFifty';
import {
  createInitialState,
  gameReducer,
  getRemainingMs,
  QUESTION_TIME_MS,
  TIMEOUT_ADVANCE_MS,
} from './gameReducer';

/** How often the countdown display refreshes. Resolution itself is deadline-based. */
const TICK_MS = 200;

/**
 * Runs a game over prepared questions (a board tile uses one). The clock starts when the
 * screen mounts. `autoAdvance: false` keeps a timed-out question on screen (with its answer)
 * instead of moving on by itself.
 */
export function useTriviaGame(questions: PlayableQuestion[], { autoAdvance = true } = {}) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createInitialState(questions, Date.now()),
  );
  const [now, setNow] = useState(() => Date.now());
  const [isAppActive, setAppActive] = useState(AppState.currentState !== 'background');

  // Latest question identity for the AppState listener, which outlives renders.
  const questionRef = useRef({ sessionId: state.sessionId, index: state.currentIndex });
  const { phase, deadline, timedOut, sessionId, currentIndex } = state;
  const paused = state.pausedRemaining !== null;
  useEffect(() => {
    questionRef.current = { sessionId, index: currentIndex };
  }, [sessionId, currentIndex]);

  // Countdown display + the deadline timeout, only while a question is open and visible.
  useEffect(() => {
    if (phase !== 'answering' || paused || !isAppActive) return;
    const tick = setInterval(() => setNow(Date.now()), TICK_MS);
    const expire = setTimeout(
      () => dispatch({ type: 'timeout', now: Date.now(), sessionId, index: currentIndex }),
      Math.max(0, deadline - Date.now()) + 20,
    );
    return () => {
      clearInterval(tick);
      clearTimeout(expire);
    };
  }, [phase, paused, deadline, isAppActive, sessionId, currentIndex]);

  // After a timeout, move on automatically. Paused while the app is in the background,
  // so unseen questions never start their clock.
  useEffect(() => {
    if (!autoAdvance || phase !== 'feedback' || !timedOut || !isAppActive) return;
    const advance = setTimeout(
      () => dispatch({ type: 'advance', now: Date.now(), sessionId, index: currentIndex }),
      TIMEOUT_ADVANCE_MS,
    );
    return () => clearTimeout(advance);
  }, [autoAdvance, phase, timedOut, isAppActive, sessionId, currentIndex]);

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
  // Host controls for a board question.
  const togglePause = useCallback(
    () => dispatch({ type: paused ? 'resume' : 'pause', now: Date.now() }),
    [paused],
  );
  const restartTimer = useCallback(() => {
    setNow(Date.now());
    dispatch({ type: 'restartTimer', now: Date.now() });
  }, []);
  const reveal = useCallback(() => dispatch({ type: 'reveal', now: Date.now() }), []);
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
    paused,
    canUseFiftyFifty:
      state.phase === 'answering' && !paused && !state.lifelineUsed && now < state.deadline,
    answer,
    next,
    applyFiftyFifty,
    togglePause,
    restartTimer,
    reveal,
  };
}
