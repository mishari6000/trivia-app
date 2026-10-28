import type { PlayableQuestion } from '../types/question';

export const QUESTION_TIME_MS = 15_000;
export const TIMEOUT_ADVANCE_MS = 1_500;

export type GamePhase = 'answering' | 'feedback' | 'results';

export type GameState = {
  /** Changes on every restart so callbacks from an old game can be recognised and ignored. */
  sessionId: number;
  questions: PlayableQuestion[];
  phase: GamePhase;
  currentIndex: number;
  score: number;
  selectedOptionId: string | null;
  lastAnswerCorrect: boolean | null;
  /** True when the active question was resolved by the timer instead of a tap. */
  timedOut: boolean;
  /** Epoch ms at which the active question expires. */
  deadline: number;
  /** Time left when the question was resolved; the timer display freezes here. */
  remainingAtResolve: number | null;
  /** 50/50 can be used once per game. */
  lifelineUsed: boolean;
  /** The two wrong options removed by 50/50 on the active question. */
  removedOptionIds: string[];
  /** Time left when the host paused the clock; null while it runs. */
  pausedRemaining: number | null;
  /** The host showed the answer without anyone answering (no points). */
  revealedByHost: boolean;
};

/** `sessionId` + `index` identify a question, so stale timer callbacks can't resolve a new one. */
type QuestionRef = { sessionId: number; index: number };

export type GameAction =
  | { type: 'answer'; optionId: string; now: number }
  | { type: 'timeout'; now: number } & QuestionRef
  | { type: 'next'; now: number }
  | { type: 'advance'; now: number } & QuestionRef
  | { type: 'fiftyFifty'; removeIds: string[]; now: number }
  | { type: 'pause'; now: number }
  | { type: 'resume'; now: number }
  | { type: 'restartTimer'; now: number }
  | { type: 'reveal'; now: number }
  | { type: 'restart'; questions: PlayableQuestion[]; now: number };

export function createInitialState(
  questions: PlayableQuestion[],
  now = 0,
  sessionId = 0,
): GameState {
  return {
    sessionId,
    questions,
    phase: 'answering',
    currentIndex: 0,
    score: 0,
    selectedOptionId: null,
    lastAnswerCorrect: null,
    timedOut: false,
    deadline: now + QUESTION_TIME_MS,
    remainingAtResolve: null,
    lifelineUsed: false,
    removedOptionIds: [],
    pausedRemaining: null,
    revealedByHost: false,
  };
}

const isActiveQuestion = (state: GameState, ref: QuestionRef) =>
  state.sessionId === ref.sessionId && state.currentIndex === ref.index;

/** Every way a question can end goes through here (or `resolveAnswer`), exactly once. */
function resolveTimeout(state: GameState): GameState {
  return {
    ...state,
    phase: 'feedback',
    selectedOptionId: null,
    lastAnswerCorrect: false,
    timedOut: true,
    remainingAtResolve: 0,
    pausedRemaining: null,
  };
}

function resolveAnswer(state: GameState, optionId: string, now: number): GameState {
  const isCorrect = optionId === state.questions[state.currentIndex].correctOptionId;
  return {
    ...state,
    phase: 'feedback',
    selectedOptionId: optionId,
    lastAnswerCorrect: isCorrect,
    timedOut: false,
    remainingAtResolve: state.deadline - now,
    score: isCorrect ? state.score + 1 : state.score,
  };
}

/** The host shows the right answer: the question ends with nobody scoring. */
function resolveReveal(state: GameState, now: number): GameState {
  return {
    ...state,
    phase: 'feedback',
    selectedOptionId: null,
    lastAnswerCorrect: false,
    timedOut: false,
    revealedByHost: true,
    remainingAtResolve: state.pausedRemaining ?? Math.max(0, state.deadline - now),
    pausedRemaining: null,
  };
}

const isPaused = (state: GameState) => state.pausedRemaining !== null;

function goToNextQuestion(state: GameState, now: number): GameState {
  if (state.currentIndex >= state.questions.length - 1) return { ...state, phase: 'results' };
  return {
    ...state,
    phase: 'answering',
    currentIndex: state.currentIndex + 1,
    selectedOptionId: null,
    lastAnswerCorrect: null,
    timedOut: false,
    // The next question's clock starts when it becomes active, never earlier.
    deadline: now + QUESTION_TIME_MS,
    remainingAtResolve: null,
    removedOptionIds: [],
    pausedRemaining: null,
    revealedByHost: false,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'answer': {
      // Only the first accepted tap counts; anything after resolution is ignored.
      if (state.phase !== 'answering' || isPaused(state)) return state;
      // A tap at or after the deadline is a timeout, even if the screen hasn't caught up.
      if (action.now >= state.deadline) return resolveTimeout(state);
      const question = state.questions[state.currentIndex];
      const isOption = question?.options.some((o) => o.id === action.optionId);
      if (!isOption || state.removedOptionIds.includes(action.optionId)) return state;
      return resolveAnswer(state, action.optionId, action.now);
    }
    case 'timeout': {
      if (state.phase !== 'answering' || isPaused(state) || !isActiveQuestion(state, action)) return state;
      if (action.now < state.deadline) return state;
      return resolveTimeout(state);
    }
    case 'next': {
      // Manual Next after a tap; timeouts advance automatically instead.
      if (state.phase !== 'feedback' || state.timedOut) return state;
      return goToNextQuestion(state, action.now);
    }
    case 'advance': {
      if (state.phase !== 'feedback' || !state.timedOut || !isActiveQuestion(state, action)) {
        return state;
      }
      return goToNextQuestion(state, action.now);
    }
    case 'fiftyFifty': {
      if (state.phase !== 'answering' || state.lifelineUsed || isPaused(state)) return state;
      if (action.now >= state.deadline) return resolveTimeout(state);
      const question = state.questions[state.currentIndex];
      const ids = new Set(action.removeIds);
      const valid =
        ids.size === 2 &&
        action.removeIds.every(
          (id) => id !== question.correctOptionId && question.options.some((o) => o.id === id),
        );
      if (!valid) return state;
      return { ...state, lifelineUsed: true, removedOptionIds: [...action.removeIds] };
    }
    case 'pause': {
      if (state.phase !== 'answering' || isPaused(state)) return state;
      if (action.now >= state.deadline) return resolveTimeout(state);
      return { ...state, pausedRemaining: state.deadline - action.now };
    }
    case 'resume': {
      if (state.phase !== 'answering' || state.pausedRemaining === null) return state;
      return { ...state, deadline: action.now + state.pausedRemaining, pausedRemaining: null };
    }
    case 'restartTimer': {
      // A fresh full clock for the same question, e.g. after the host reads it out.
      if (state.phase !== 'answering') return state;
      return { ...state, deadline: action.now + QUESTION_TIME_MS, pausedRemaining: null };
    }
    case 'reveal': {
      if (state.phase !== 'answering') return state;
      return resolveReveal(state, action.now);
    }
    case 'restart':
      return createInitialState(action.questions, action.now, state.sessionId + 1);
    default:
      return state;
  }
}

/** Milliseconds left on the active question; frozen once it is resolved. */
export function getRemainingMs(state: GameState, now: number): number {
  // Clamped so a display clock that is a tick behind never shows more than the full time.
  if (state.phase === 'answering') {
    if (state.pausedRemaining !== null) return state.pausedRemaining;
    return Math.min(QUESTION_TIME_MS, Math.max(0, state.deadline - now));
  }
  return Math.max(0, state.remainingAtResolve ?? 0);
}
