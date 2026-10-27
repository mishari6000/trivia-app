import { getLocalQuestions } from '../../data/getLocalQuestions';
import { createInitialState, gameReducer, type GameState } from '../gameReducer';
import { getQuestionProgress } from '../progress';

const answerAndNext = (state: GameState) =>
  gameReducer(
    gameReducer(state, {
      type: 'answer',
      optionId: state.questions[state.currentIndex].correctOptionId,
    }),
    { type: 'next' },
  );

describe('getQuestionProgress', () => {
  it('starts at 1 of the session length', () => {
    const state = createInitialState(getLocalQuestions());
    expect(getQuestionProgress(state)).toEqual({ current: 1, total: 5 });
  });

  it('derives the total from the session, not a fixed number', () => {
    const state = createInitialState(getLocalQuestions().slice(0, 3));
    expect(getQuestionProgress(state).total).toBe(3);
  });

  it('counts up to 5 of 5 and never shows 6 of 5', () => {
    let state = createInitialState(getLocalQuestions());
    const seen: number[] = [];
    while (state.phase !== 'results') {
      seen.push(getQuestionProgress(state).current);
      state = answerAndNext(state);
    }
    expect(seen).toEqual([1, 2, 3, 4, 5]);
    // On results (and with extra taps) it stays capped at the total.
    state = gameReducer(state, { type: 'next' });
    expect(getQuestionProgress(state)).toEqual({ current: 5, total: 5 });
  });

  it('does not advance while showing feedback', () => {
    const state = gameReducer(createInitialState(getLocalQuestions()), {
      type: 'answer',
      optionId: getLocalQuestions()[0].correctOptionId,
    });
    expect(getQuestionProgress(state).current).toBe(1);
  });

  it('resets to 1 on play again', () => {
    let state = createInitialState(getLocalQuestions());
    state = answerAndNext(answerAndNext(state));
    expect(getQuestionProgress(state).current).toBe(3);
    state = gameReducer(state, { type: 'restart', questions: getLocalQuestions() });
    expect(getQuestionProgress(state)).toEqual({ current: 1, total: 5 });
  });
});
