import type { GameState } from './gameReducer';

export type QuestionProgressInfo = {
  /** 1-based number of the active question; never exceeds `total`. */
  current: number;
  total: number;
};

/** Progress derived from the session itself, so the total is never a duplicated magic number. */
export function getQuestionProgress(state: GameState): QuestionProgressInfo {
  const total = state.questions.length;
  return { current: Math.min(state.currentIndex + 1, total), total };
}
