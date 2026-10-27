import type { GameState } from './gameReducer';

/**
 * idle      – not answered yet
 * correct   – the player's correct pick
 * incorrect – the player's wrong pick
 * revealed  – the right answer, shown after a wrong pick
 * dimmed    – any other option once the question is locked
 */
export type AnswerStatus = 'idle' | 'correct' | 'incorrect' | 'revealed' | 'dimmed';

export function getAnswerStatus(state: GameState, optionId: string): AnswerStatus {
  if (state.selectedOptionId === null) return 'idle';
  const question = state.questions[state.currentIndex];

  if (optionId === state.selectedOptionId) {
    return state.lastAnswerCorrect ? 'correct' : 'incorrect';
  }
  if (!state.lastAnswerCorrect && optionId === question?.correctOptionId) return 'revealed';
  return 'dimmed';
}

/** Text of the right answer to show after a wrong pick; null otherwise. */
export function getRevealedAnswer(state: GameState): string | null {
  if (state.selectedOptionId === null || state.lastAnswerCorrect) return null;
  const question = state.questions[state.currentIndex];
  return question?.options.find((o) => o.id === question.correctOptionId)?.text ?? null;
}
