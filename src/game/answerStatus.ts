import type { GameState } from './gameReducer';

/**
 * idle      – can still be picked
 * correct   – the player's correct pick
 * incorrect – the player's wrong pick
 * revealed  – the right answer, shown after a wrong pick, a timeout or «اظهر الجواب»
 * dimmed    – any other option once the question is locked
 * removed   – taken out by 50/50; not selectable or announced
 */
export type AnswerStatus = 'idle' | 'correct' | 'incorrect' | 'revealed' | 'dimmed' | 'removed';

export type FeedbackOutcome = 'correct' | 'incorrect' | 'timeout' | 'revealed';

export function getAnswerStatus(state: GameState, optionId: string): AnswerStatus {
  if (state.removedOptionIds.includes(optionId)) return 'removed';
  if (state.phase !== 'feedback') return 'idle';
  const question = state.questions[state.currentIndex];

  if (optionId === state.selectedOptionId) {
    return state.lastAnswerCorrect ? 'correct' : 'incorrect';
  }
  if (!state.lastAnswerCorrect && optionId === question?.correctOptionId) return 'revealed';
  return 'dimmed';
}

export function getFeedbackOutcome(state: GameState): FeedbackOutcome | null {
  if (state.phase !== 'feedback') return null;
  if (state.revealedByHost) return 'revealed';
  if (state.timedOut) return 'timeout';
  return state.lastAnswerCorrect ? 'correct' : 'incorrect';
}

/** Text of the right answer to show after a wrong pick or a timeout; null otherwise. */
export function getRevealedAnswer(state: GameState): string | null {
  if (state.phase !== 'feedback' || state.lastAnswerCorrect) return null;
  const question = state.questions[state.currentIndex];
  return question?.options.find((o) => o.id === question.correctOptionId)?.text ?? null;
}
