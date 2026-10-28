import { getLocalQuestions } from '../../data/getLocalQuestions';
import { prepareSession } from '../shuffle';
import { getAnswerStatus, getFeedbackOutcome, getRevealedAnswer } from '../answerStatus';
import {
  createInitialState,
  gameReducer,
  getRemainingMs,
  QUESTION_TIME_MS,
  type GameAction,
  type GameState,
} from '../gameReducer';

// A moment well inside the first question's 15-second window.
const T = 1000;

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
    const state = play(initial, { type: 'answer', now: T, optionId: initial.questions[0].correctOptionId });
    expect(state.score).toBe(1);
    expect(state.phase).toBe('feedback');
    expect(state.lastAnswerCorrect).toBe(true);
  });

  it('adds zero points for an incorrect answer', () => {
    const state = play(initial, { type: 'answer', now: T, optionId: wrongOptionId(initial) });
    expect(state.score).toBe(0);
    expect(state.lastAnswerCorrect).toBe(false);
  });

  it('locks the answer after the first accepted tap', () => {
    const correct = initial.questions[0].correctOptionId;
    const wrong = wrongOptionId(initial);

    const repeated = play(
      initial,
      { type: 'answer', now: T, optionId: correct },
      { type: 'answer', now: T, optionId: correct },
      { type: 'answer', now: T, optionId: correct },
    );
    expect(repeated.score).toBe(1);

    const switched = play(
      initial,
      { type: 'answer', now: T, optionId: wrong },
      { type: 'answer', now: T, optionId: correct },
    );
    expect(switched.selectedOptionId).toBe(wrong);
    expect(switched.score).toBe(0);
  });

  it('ignores unknown option ids and next before answering', () => {
    expect(play(initial, { type: 'answer', now: T, optionId: 'nope' })).toBe(initial);
    expect(play(initial, { type: 'next', now: T })).toBe(initial);
  });

  it('does not skip questions on rapid next taps', () => {
    const answered = play(initial, { type: 'answer', now: T, optionId: wrongOptionId(initial) });
    const state = play(answered, { type: 'next', now: T }, { type: 'next', now: T }, { type: 'next', now: T });
    expect(state.currentIndex).toBe(1);
    expect(state.phase).toBe('answering');
  });

  it('completes all five questions and shows results with the correct score', () => {
    let state = initial;
    const correctPattern = [true, false, true, true, false];
    correctPattern.forEach((isCorrect) => {
      const q = state.questions[state.currentIndex];
      const optionId = isCorrect ? q.correctOptionId : wrongOptionId(state);
      state = play(state, { type: 'answer', now: T, optionId }, { type: 'next', now: T });
    });

    expect(state.questions).toHaveLength(5);
    expect(state.phase).toBe('results');
    expect(state.score).toBe(3);
    expect(state.currentIndex).toBe(4);
    // Nothing changes the score once results are shown.
    expect(play(state, { type: 'answer', now: T, optionId: 'x' }, { type: 'next', now: T })).toBe(state);
  });

  it('resets everything on restart', () => {
    let state = initial;
    for (let i = 0; i < 5; i++) {
      state = play(
        state,
        { type: 'answer', now: T, optionId: state.questions[state.currentIndex].correctOptionId },
        { type: 'next', now: T },
      );
    }
    expect(state.score).toBe(5);

    const fresh = prepareSession(getLocalQuestions());
    const restarted = play(state, { type: 'restart', now: T, questions: fresh });
    expect(restarted).toEqual(createInitialState(fresh, T, state.sessionId + 1));
    expect(restarted.score).toBe(0);
    expect(restarted.currentIndex).toBe(0);
  });
});

describe('host controls (board questions)', () => {
  const one = getLocalQuestions('History').slice(0, 1);
  const start = () => createInitialState(one, 0);

  it('pause freezes the clock, blocks answers and timeouts, and resume continues from there', () => {
    let s = gameReducer(start(), { type: 'pause', now: 4_000 });
    expect(getRemainingMs(s, 60_000)).toBe(11_000);
    expect(gameReducer(s, { type: 'answer', optionId: one[0].correctOptionId, now: 5_000 })).toBe(s);
    expect(gameReducer(s, { type: 'timeout', now: 99_000, sessionId: 0, index: 0 })).toBe(s);
    s = gameReducer(s, { type: 'resume', now: 50_000 });
    expect(s.deadline).toBe(61_000);
    expect(getRemainingMs(s, 51_000)).toBe(10_000);
  });

  it('restart gives the same question a full clock again', () => {
    const s = gameReducer(start(), { type: 'restartTimer', now: 12_000 });
    expect(s.phase).toBe('answering');
    expect(getRemainingMs(s, 12_000)).toBe(QUESTION_TIME_MS);
  });

  it('«اظهر الجواب» ends the question with no points and shows the right answer', () => {
    const s = gameReducer(start(), { type: 'reveal', now: 3_000 });
    expect(s.phase).toBe('feedback');
    expect(s.score).toBe(0);
    expect(getFeedbackOutcome(s)).toBe('revealed');
    expect(getAnswerStatus(s, one[0].correctOptionId)).toBe('revealed');
    expect(getRevealedAnswer(s)).toBe(one[0].options.find((o) => o.id === one[0].correctOptionId)?.text);
    expect(gameReducer(s, { type: 'answer', optionId: one[0].correctOptionId, now: 3_500 })).toBe(s);
  });
});
