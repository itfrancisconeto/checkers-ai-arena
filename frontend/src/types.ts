export type PlayerType = "human" | "ai";

export type Piece = {
  player: PlayerType;
  king: boolean;
} | null;

export type BoardState = Piece[][];

export type Position = {
  row: number;
  col: number;
};

export type MoveCandidate = {
  from: Position;
  to: Position;
  captured: Position[];
};

export type GameMove = {
  id: number;
  player_type: PlayerType;
  from_position: Position;
  to_position: Position;
  captured_positions: Position[];
  reward: number;
  created_at: string;
};

export type Game = {
  id: number;
  board_state: BoardState;
  status: string;
  current_turn: string;
  winner: string | null;
  moves: GameMove[];
};

export type LearningStats = {
  experiences: number;
  confidence: number;
  explorationRate: number;
  lastReward: number;
  accumulatedReward: number;
  mode: "Explorando jogadas" | "Usando experiência aprendida";
  timeline: string[];
  rewardHistory: number[];
};
