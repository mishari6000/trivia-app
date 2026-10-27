import { getLocalQuestions } from '../../data/getLocalQuestions';
import { getAnswerStatus, getRevealedAnswer } from '../answerStatus';
import { createInitialState, gameReducer, type GameState } from '../gameReducer';

const setup = () => {
  const state = createInitialState(getLocalQuestions());
  const question = state.questions[0];
  const correct = question.options.find((o) => o.id === question.correctOptionId)!;
  const wrong = question.options.filter((o) => o.id !== question.correctOptionId);
  return { state, question, correct, wrong };
};

const statuses = (state: GameState) =>
  Object.fromEntries(
    state.questions[state.currentIndex].options.map((o) => [o.id, getAnswerStatus(state, o.id)]),
  );

describe('answer reveal', () => {
  it('shows nothing before an answer', () => {
    const { state } = setup();
    expect(Object.values(statuses(state))).toEqual(['idle', 'idle', 'idle', 'idle']);
    expect(getRevealedAnswer(state)).toBeNull();
  });

  it('after a wrong answer marks the pick wrong and reveals the right one', () => {
    const { state, correct, wrong } = setup();
    const after = gameReducer(state, { type: 'answer', optionId: wrong[0].id });

    const s = statuses(after);
    expect(s[wrong[0].id]).toBe('incorrect');
    expect(s[correct.id]).toBe('revealed');
    expect(s[wrong[1].id]).toBe('dimmed');
    expect(s[wrong[2].id]).toBe('dimmed');
    expect(getRevealedAnswer(after)).toBe(correct.text);
  });

  it('revealing never awards a point and options stay locked', () => {
    const { state, correct, wrong } = setup();
    let after = gameReducer(state, { type: 'answer', optionId: wrong[0].id });
    expect(after.score).toBe(0);

    // Tapping the revealed correct answer afterwards changes nothing.
    after = gameReducer(after, { type: 'answer', optionId: correct.id });
    expect(after.score).toBe(0);
    expect(after.selectedOptionId).toBe(wrong[0].id);
    expect(getAnswerStatus(after, correct.id)).toBe('revealed');
  });

  it('a correct answer still awards exactly one point with no reveal', () => {
    const { state, correct, wrong } = setup();
    const after = gameReducer(state, { type: 'answer', optionId: correct.id });

    expect(after.score).toBe(1);
    const s = statuses(after);
    expect(s[correct.id]).toBe('correct');
    wrong.forEach((o) => expect(s[o.id]).toBe('dimmed'));
    expect(Object.values(s)).not.toContain('revealed');
    expect(getRevealedAnswer(after)).toBeNull();
  });

  it('clears the reveal on the next question', () => {
    const { state, wrong } = setup();
    const next = gameReducer(gameReducer(state, { type: 'answer', optionId: wrong[0].id }), {
      type: 'next',
    });
    expect(Object.values(statuses(next))).toEqual(['idle', 'idle', 'idle', 'idle']);
    expect(getRevealedAnswer(next)).toBeNull();
  });
});
