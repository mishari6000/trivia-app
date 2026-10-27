import { getLocalQuestions } from '../../data/getLocalQuestions';
import { getAnswerStatus, getFeedbackOutcome, getRevealedAnswer } from '../answerStatus';
import { pickFiftyFiftyRemovals } from '../fiftyFifty';
import {
  createInitialState,
  gameReducer,
  getRemainingMs,
  QUESTION_TIME_MS,
  type GameAction,
  type GameState,
} from '../gameReducer';
import { prepareSession, type RandomSource } from '../shuffle';

/** All times are plain numbers: the reducer never reads the clock, so no flaky timing. */
const START = 1_000_000;
const DEADLINE = START + QUESTION_TIME_MS;

const newGame = () => createInitialState(prepareSession(getLocalQuestions()), START, 7);
const play = (state: GameState, ...actions: GameAction[]) => actions.reduce(gameReducer, state);
const ref = (state: GameState) => ({ sessionId: state.sessionId, index: state.currentIndex });
const current = (state: GameState) => state.questions[state.currentIndex];
const wrongIds = (state: GameState) =>
  current(state)
    .options.filter((o) => o.id !== current(state).correctOptionId)
    .map((o) => o.id);
const timeout = (state: GameState, now = DEADLINE): GameAction => ({
  type: 'timeout',
  now,
  ...ref(state),
});

/** Deterministic random source so 50/50 picks are repeatable. */
const sequence =
  (...values: number[]): RandomSource =>
  () =>
    values.shift() ?? 0;

describe('timer', () => {
  it('starts each question with 15 seconds', () => {
    const state = newGame();
    expect(state.deadline).toBe(START + 15_000);
    expect(getRemainingMs(state, START)).toBe(15_000);
    expect(getRemainingMs(state, START + 4_200)).toBe(10_800);
  });

  it('freezes when an answer is accepted before the deadline', () => {
    const game = newGame();
    const state = play(game, {
      type: 'answer',
      now: START + 6_000,
      optionId: current(game).correctOptionId,
    });
    expect(state.phase).toBe('feedback');
    expect(getRemainingMs(state, START + 6_000)).toBe(9_000);
    expect(getRemainingMs(state, START + 60_000)).toBe(9_000);
    expect(state.score).toBe(1);
  });

  it('timeout locks the question, gives zero points and reveals the answer', () => {
    const game = newGame();
    const state = play(game, timeout(game));

    expect(state.phase).toBe('feedback');
    expect(state.timedOut).toBe(true);
    expect(state.score).toBe(0);
    expect(getFeedbackOutcome(state)).toBe('timeout');
    expect(getRevealedAnswer(state)).toBe(
      current(state).options.find((o) => o.id === current(state).correctOptionId)?.text,
    );
    expect(getAnswerStatus(state, current(state).correctOptionId)).toBe('revealed');
    // Late taps can't change the result.
    const late = play(state, { type: 'answer', now: DEADLINE + 1, optionId: wrongIds(state)[0] });
    expect(late).toBe(state);
  });

  it('ignores a timeout that fires before the deadline', () => {
    const game = newGame();
    expect(play(game, timeout(game, DEADLINE - 1))).toBe(game);
  });

  it('auto-advances after a timeout and gives the next question a fresh 15 seconds', () => {
    const game = newGame();
    const timedOut = play(game, timeout(game));
    const advanceAt = DEADLINE + 1_500;
    const next = play(timedOut, { type: 'advance', now: advanceAt, ...ref(timedOut) });

    expect(next.currentIndex).toBe(1);
    expect(next.phase).toBe('answering');
    expect(next.timedOut).toBe(false);
    expect(next.deadline).toBe(advanceAt + 15_000);
    // Manual Next is not how timeouts move on.
    expect(play(timedOut, { type: 'next', now: advanceAt })).toBe(timedOut);
  });

  it('a timeout on the fifth question opens the results', () => {
    let state = newGame();
    let now = START;
    for (let i = 0; i < 5; i++) {
      now = state.deadline;
      state = play(state, timeout(state, now));
      state = play(state, { type: 'advance', now: now + 1_500, ...ref(state) });
    }
    expect(state.phase).toBe('results');
    expect(state.score).toBe(0);
  });
});

describe('deadline and answer races resolve once', () => {
  it('a tap exactly at the deadline counts as a timeout', () => {
    const game = newGame();
    const state = play(game, { type: 'answer', now: DEADLINE, optionId: current(game).correctOptionId });
    expect(state.timedOut).toBe(true);
    expect(state.score).toBe(0);
  });

  it('answer then timeout: the answer wins, the timeout is ignored', () => {
    const game = newGame();
    const answered = play(game, {
      type: 'answer',
      now: DEADLINE - 1,
      optionId: current(game).correctOptionId,
    });
    const after = play(answered, timeout(game));
    expect(after).toBe(answered);
    expect(after.score).toBe(1);
    expect(after.timedOut).toBe(false);
  });

  it('timeout then answer: the timeout wins, the answer is ignored', () => {
    const game = newGame();
    const timedOut = play(game, timeout(game));
    const after = play(timedOut, {
      type: 'answer',
      now: DEADLINE - 1,
      optionId: current(game).correctOptionId,
    });
    expect(after).toBe(timedOut);
    expect(after.score).toBe(0);
  });

  it('duplicate timeouts and auto-advances resolve only once', () => {
    const game = newGame();
    const once = play(game, timeout(game));
    expect(play(once, timeout(game))).toBe(once);

    const advance: GameAction = { type: 'advance', now: DEADLINE + 1_500, ...ref(once) };
    const advanced = play(once, advance);
    expect(play(advanced, advance).currentIndex).toBe(1);
  });

  it('rapid Next taps move forward only one question', () => {
    const game = newGame();
    const answered = play(game, { type: 'answer', now: START + 1, optionId: wrongIds(game)[0] });
    const state = play(
      answered,
      { type: 'next', now: START + 2 },
      { type: 'next', now: START + 3 },
      { type: 'next', now: START + 4 },
    );
    expect(state.currentIndex).toBe(1);
  });
});

describe('stale callbacks after reset', () => {
  it('a timeout or advance from the old game does not touch the new game', () => {
    const old = newGame();
    const staleTimeout = timeout(old);
    const staleAdvance: GameAction = { type: 'advance', now: DEADLINE + 1_500, ...ref(old) };

    const restartedAt = START + 5_000;
    const fresh = play(old, {
      type: 'restart',
      now: restartedAt,
      questions: prepareSession(getLocalQuestions()),
    });
    expect(fresh.sessionId).toBe(old.sessionId + 1);

    // Even long after the old deadline, the old game's callbacks are ignored.
    expect(play(fresh, staleTimeout)).toBe(fresh);
    expect(play(fresh, staleAdvance)).toBe(fresh);
  });

  it('a timeout scheduled for an earlier question does not resolve the next one', () => {
    const game = newGame();
    const answered = play(game, { type: 'answer', now: START + 1, optionId: wrongIds(game)[0] });
    const second = play(answered, { type: 'next', now: START + 2 });
    expect(play(second, timeout(game, DEADLINE + 10_000))).toBe(second);
  });
});

describe('background and foreground reconciliation', () => {
  it('on return after the deadline the active question times out exactly once', () => {
    const game = newGame();
    const returnedAt = DEADLINE + 60_000; // away for a minute
    const reconciled = play(game, timeout(game, returnedAt));
    expect(reconciled.timedOut).toBe(true);
    expect(reconciled.currentIndex).toBe(0);
    // A second reconcile (e.g. another focus event) changes nothing.
    expect(play(reconciled, timeout(reconciled, returnedAt + 10))).toBe(reconciled);
  });

  it('does not charge unseen questions: the next one starts when it becomes active', () => {
    const game = newGame();
    const returnedAt = DEADLINE + 60_000;
    const reconciled = play(game, timeout(game, returnedAt));
    const shownAt = returnedAt + 1_500;
    const next = play(reconciled, { type: 'advance', now: shownAt, ...ref(reconciled) });

    expect(next.currentIndex).toBe(1);
    expect(next.phase).toBe('answering');
    expect(getRemainingMs(next, shownAt)).toBe(15_000);
  });

  it('returning before the deadline keeps the question open', () => {
    const game = newGame();
    expect(play(game, timeout(game, DEADLINE - 3_000))).toBe(game);
  });
});

describe('50/50', () => {
  it('keeps the correct answer and exactly one wrong answer', () => {
    for (let seed = 0; seed < 20; seed++) {
      const game = newGame();
      const removeIds = pickFiftyFiftyRemovals(current(game), sequence(seed / 20, ((seed * 7) % 20) / 20));
      const state = play(game, { type: 'fiftyFifty', now: START + 1, removeIds });

      expect(state.lifelineUsed).toBe(true);
      expect(state.removedOptionIds).toHaveLength(2);
      expect(state.removedOptionIds).not.toContain(current(state).correctOptionId);
      const remaining = current(state).options.filter(
        (o) => getAnswerStatus(state, o.id) !== 'removed',
      );
      expect(remaining).toHaveLength(2);
      expect(remaining.filter((o) => o.id === current(state).correctOptionId)).toHaveLength(1);
    }
  });

  it('does not reorder answers or reset the timer', () => {
    const game = newGame();
    const order = current(game).options.map((o) => o.id);
    const state = play(game, {
      type: 'fiftyFifty',
      now: START + 3_000,
      removeIds: wrongIds(game).slice(0, 2),
    });
    expect(current(state).options.map((o) => o.id)).toEqual(order);
    expect(state.deadline).toBe(game.deadline);
  });

  it('removed answers cannot be selected', () => {
    const game = newGame();
    const removed = wrongIds(game).slice(0, 2);
    const state = play(game, { type: 'fiftyFifty', now: START + 1, removeIds: removed });
    expect(play(state, { type: 'answer', now: START + 2, optionId: removed[0] })).toBe(state);
  });

  it('works once per game: rapid and later uses are blocked', () => {
    const game = newGame();
    const first = play(game, {
      type: 'fiftyFifty',
      now: START + 1,
      removeIds: wrongIds(game).slice(0, 2),
    });
    // A rapid second tap with a different random pick changes nothing.
    expect(
      play(first, { type: 'fiftyFifty', now: START + 2, removeIds: wrongIds(game).slice(1, 3) }),
    ).toBe(first);

    // Still blocked on the next question, where the removed answers are cleared.
    const answered = play(first, {
      type: 'answer',
      now: START + 3,
      optionId: current(first).correctOptionId,
    });
    const second = play(answered, { type: 'next', now: START + 4 });
    expect(second.removedOptionIds).toEqual([]);
    expect(second.lifelineUsed).toBe(true);
    expect(
      play(second, { type: 'fiftyFifty', now: START + 5, removeIds: wrongIds(second).slice(0, 2) }),
    ).toBe(second);
  });

  it('is unavailable during feedback, after the deadline and with an invalid pick', () => {
    const game = newGame();
    const answered = play(game, { type: 'answer', now: START + 1, optionId: wrongIds(game)[0] });
    expect(
      play(answered, { type: 'fiftyFifty', now: START + 2, removeIds: wrongIds(game).slice(1) }),
    ).toBe(answered);

    const late = play(game, {
      type: 'fiftyFifty',
      now: DEADLINE,
      removeIds: wrongIds(game).slice(0, 2),
    });
    expect(late.lifelineUsed).toBe(false);
    expect(late.timedOut).toBe(true);

    const withCorrect = [current(game).correctOptionId, wrongIds(game)[0]];
    expect(play(game, { type: 'fiftyFifty', now: START + 1, removeIds: withCorrect })).toBe(game);
  });

  it('Play again restores the lifeline and clears removed answers', () => {
    const game = newGame();
    const used = play(game, {
      type: 'fiftyFifty',
      now: START + 1,
      removeIds: wrongIds(game).slice(0, 2),
    });
    const fresh = play(used, {
      type: 'restart',
      now: START + 2,
      questions: prepareSession(getLocalQuestions()),
    });
    expect(fresh.lifelineUsed).toBe(false);
    expect(fresh.removedOptionIds).toEqual([]);
    expect(fresh.score).toBe(0);
    expect(getRemainingMs(fresh, START + 2)).toBe(15_000);
  });
});
