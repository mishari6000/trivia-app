import type { CategoryName, Difficulty } from '../types/question';

/** Rows of every column, top to bottom: two tiles per level. */
export const ROW_POINTS = [100, 100, 300, 300, 500, 500] as const;
export const POINTS_LEVEL: Record<(typeof ROW_POINTS)[number], Difficulty> = {
  100: 'easy',
  300: 'medium',
  500: 'hard',
};
export const BOARD_CATEGORIES = 6;
/** Each tap of the +/− buttons beside a team's score. */
export const SCORE_STEP = 100;

export type TeamIndex = 0 | 1;
export type Team = { name: string; score: number; fiftyFiftyUsed: boolean };

export type Tile = {
  id: string;
  category: CategoryName;
  points: (typeof ROW_POINTS)[number];
  difficulty: Difficulty;
  /** Set once the tile has been played: which team answered and whether it was right. */
  result: { team: TeamIndex; correct: boolean } | null;
};

export type BoardState = {
  categories: CategoryName[];
  tiles: Tile[];
  teams: [Team, Team];
  /** The team whose turn it is to pick a tile and answer. */
  turn: TeamIndex;
};

export type BoardAction =
  | { type: 'resolve'; tileId: string; correct: boolean; usedFiftyFifty: boolean }
  | { type: 'adjust'; team: TeamIndex; delta: number }
  | { type: 'switchTurn' }
  | { type: 'new'; categories: CategoryName[]; teamNames: [string, string] };

export function createBoard(categories: CategoryName[], teamNames: [string, string]): BoardState {
  if (categories.length !== BOARD_CATEGORIES) {
    throw new Error(`A board needs exactly ${BOARD_CATEGORIES} categories`);
  }
  return {
    categories,
    tiles: categories.flatMap((category) =>
      ROW_POINTS.map((points, row) => ({
        id: `${category}|${row}`,
        category,
        points,
        difficulty: POINTS_LEVEL[points],
        result: null,
      })),
    ),
    teams: [
      { name: teamNames[0], score: 0, fiftyFiftyUsed: false },
      { name: teamNames[1], score: 0, fiftyFiftyUsed: false },
    ],
    turn: 0,
  };
}

const other = (team: TeamIndex): TeamIndex => (team === 0 ? 1 : 0);

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'resolve': {
      const tile = state.tiles.find((t) => t.id === action.tileId);
      // A tile is played once; a repeated or stale result is ignored.
      if (!tile || tile.result) return state;
      const team = state.turn;
      const teams = [...state.teams] as [Team, Team];
      teams[team] = {
        ...teams[team],
        score: teams[team].score + (action.correct ? tile.points : 0),
        fiftyFiftyUsed: teams[team].fiftyFiftyUsed || action.usedFiftyFifty,
      };
      return {
        ...state,
        teams,
        tiles: state.tiles.map((t) => (t.id === tile.id ? { ...t, result: { team, correct: action.correct } } : t)),
        turn: other(team),
      };
    }
    case 'adjust': {
      // The host's manual correction; a score never goes below zero.
      const teams = [...state.teams] as [Team, Team];
      teams[action.team] = { ...teams[action.team], score: Math.max(0, teams[action.team].score + action.delta) };
      return { ...state, teams };
    }
    case 'switchTurn':
      return { ...state, turn: other(state.turn) };
    case 'new':
      return createBoard(action.categories, action.teamNames);
  }
}

export const isFinished = (state: BoardState) => state.tiles.every((t) => t.result !== null);

/** The winning team, or null for a tie. */
export function winner(state: BoardState): TeamIndex | null {
  const [a, b] = state.teams;
  if (a.score === b.score) return null;
  return a.score > b.score ? 0 : 1;
}
