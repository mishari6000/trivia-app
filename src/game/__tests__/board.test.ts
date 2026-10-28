import type { CategoryName } from '../../types/question';
import { boardReducer, createBoard, isFinished, ROW_POINTS, winner } from '../board';

const SIX: CategoryName[] = ['General Knowledge', 'History', 'Geography', 'Sports', 'Art', 'Animals'];
const fresh = () => createBoard(SIX, ['الصقور', 'النجوم']);
const resolve = (tileId: string, correct: boolean, usedFiftyFifty = false) =>
  ({ type: 'resolve', tileId, correct, usedFiftyFifty }) as const;

describe('board', () => {
  it('has six columns of 100, 100, 300, 300, 500, 500 mapped to easy, medium, hard', () => {
    const board = fresh();
    expect(board.tiles).toHaveLength(36);
    const history = board.tiles.filter((t) => t.category === 'History');
    expect(history.map((t) => t.points)).toEqual([...ROW_POINTS]);
    expect(history.map((t) => t.difficulty)).toEqual(['easy', 'easy', 'medium', 'medium', 'hard', 'hard']);
    expect(board.teams.map((t) => t.name)).toEqual(['الصقور', 'النجوم']);
    expect(board.turn).toBe(0);
    expect(() => createBoard(SIX.slice(0, 5), ['أ', 'ب'])).toThrow();
  });

  it('a right answer scores the tile for the team in turn, then the turn passes', () => {
    let board = fresh();
    board = boardReducer(board, resolve('History|4', true)); // 500 for team 0
    expect(board.teams[0].score).toBe(500);
    expect(board.turn).toBe(1);
    board = boardReducer(board, resolve('Art|0', false)); // team 1 misses a 100
    expect(board.teams[1].score).toBe(0);
    expect(board.turn).toBe(0);
    expect(board.tiles.find((t) => t.id === 'Art|0')?.result).toEqual({ team: 1, correct: false });
  });

  it('plays each tile once, and remembers who used their 50/50', () => {
    let board = boardReducer(fresh(), resolve('Sports|2', true, true));
    const again = boardReducer(board, resolve('Sports|2', true));
    expect(again).toBe(board);
    expect(board.teams[0].fiftyFiftyUsed).toBe(true);
    expect(board.teams[1].fiftyFiftyUsed).toBe(false);
  });

  it('lets the host fix scores (never below zero) and switch the turn', () => {
    let board = boardReducer(fresh(), { type: 'adjust', team: 1, delta: 100 });
    board = boardReducer(board, { type: 'adjust', team: 0, delta: -100 });
    expect(board.teams.map((t) => t.score)).toEqual([0, 100]);
    expect(boardReducer(board, { type: 'switchTurn' }).turn).toBe(1);
  });

  it('finishes when every tile is played, and names the winner (or a tie)', () => {
    let board = fresh();
    expect(winner(board)).toBeNull();
    board.tiles.forEach((tile, i) => {
      board = boardReducer(board, resolve(tile.id, i === 0));
    });
    expect(isFinished(board)).toBe(true);
    expect(winner(board)).toBe(0);
  });
});
