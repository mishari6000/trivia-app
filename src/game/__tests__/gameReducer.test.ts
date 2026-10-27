import { getLocalQuestions } from '../../data/getLocalQuestions';
import { prepareSession } from '../shuffle';
import { createInitialState, gameReducer, type GameAction, type GameState } from '../gameReducer';

const play = (state: GameState, ...actions: GameAction[]) => actions.reduce(gameReducer, state);

const wrongOptionId = (state: GameState) =>
  state.questions[state.currentIndex].options.find(
    (o) => o.id !== state.questions[state.currentIndex].correctOptionId,
  )!.id;

describe('gameReducer', () => {
  let initial: GameState;

  beforeEach(() => {
    initial = createInitialState(prepareSession(getLocalQuestions()));
  });

  it('starts at question one with score zero', () => {
    expect(initial.phase).toBe('answering');
    expect(initial.currentIndex).toBe(0);
    expect(initial.score).toBe(0);
    expect(initial.selectedOptionId).toBeNull();
    expect(initial.lastAnswerCorrect).toBeNull();
  });

  it('adds exactly one point for a correct answer', () => {
    const state = play(initial, { type: 'answer', optionId: initial.questions[0].correctOptionId });
    expect(state.score).toBe(1);
    expect(state.phase).toBe('feedback');
    expect(state.lastAnswerCorrect).toBe(true);
  });

  it('adds zero points for an incorrect answer', () => {
    const state = play(initial, { type: 'answer', optionId: wrongOptionId(initial) });
    expect(state.score).toBe(0);
    expect(state.lastAnswerCorrect).toBe(false);
  });

  it('locks the answer after the first accepted tap', () => {
    const correct = initial.questions[0].correctOptionId;
    const wrong = wrongOptionId(initial);

    const repeated = play(
      initial,
      { type: 'answer', optionId: correct },
      { type: 'answer', optionId: correct },
      { type: 'answer', optionId: correct },
    );
    expect(repeated.score).toBe(1);

    const switched = play(
      initial,
      { type: 'answer', optionId: wrong },
      { type: 'answer', optionId: correct },
    );
    expect(switched.selectedOptionId).toBe(wrong);
    expect(switched.score).toBe(0);
  });

  it('ignores unknown option ids and next before answering', () => {
    expect(play(initial, { type: 'answer', optionId: 'nope' })).toBe(initial);
    expect(play(initial, { type: 'next' })).toBe(initial);
  });

  it('does not skip questions on rapid next taps', () => {
    const answered = play(initial, { type: 'answer', optionId: wrongOptionId(initial) });
    const state = play(answered, { type: 'next' }, { type: 'next' }, { type: 'next' });
    expect(state.currentIndex).toBe(1);
    expect(state.phase).toBe('answering');
  });

  it('completes all five questions and shows results with the correct score', () => {
    let state = initial;
    const correctPattern = [true, false, true, true, false];
    correctPattern.forEach((isCorrect) => {
      const q = state.questions[state.currentIndex];
      const optionId = isCorrect ? q.correctOptionId : wrongOptionId(state);
      state = play(state, { type: 'answer', optionId }, { type: 'next' });
    });

    expect(state.questions).toHaveLength(5);
    expect(state.phase).toBe('results');
    expect(state.score).toBe(3);
    expect(state.currentIndex).toBe(4);
    // Nothing changes the score once results are shown.
    expect(play(state, { type: 'answer', optionId: 'x' }, { type: 'next' })).toBe(state);
  });

  it('resets everything on restart', () => {
    let state = initial;
    for (let i = 0; i < 5; i++) {
      state = play(
        state,
        { type: 'answer', optionId: state.questions[state.currentIndex].correctOptionId },
        { type: 'next' },
      );
    }
    expect(state.score).toBe(5);

    const fresh = prepareSession(getLocalQuestions());
    const restarted = play(state, { type: 'restart', questions: fresh });
    expect(restarted).toEqual(createInitialState(fresh));
    expect(restarted.score).toBe(0);
    expect(restarted.currentIndex).toBe(0);
  });
});
