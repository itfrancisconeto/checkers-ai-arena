import type { BoardState, MoveCandidate, Piece, PlayerType, Position } from "../types";

const directions: Record<PlayerType, number[][]> = {
  human: [[-1, -1], [-1, 1]],
  ai: [[1, -1], [1, 1]]
};

function inside(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function dirsFor(piece: Exclude<Piece, null>): number[][] {
  if (piece.king) return [...directions.human, ...directions.ai];
  return directions[piece.player];
}

export function legalMovesFor(board: BoardState, player: PlayerType): MoveCandidate[] {
  const moves: MoveCandidate[] = [];

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col];
      if (!piece || piece.player !== player) continue;

      for (const [dr, dc] of dirsFor(piece)) {
        const simpleRow = row + dr;
        const simpleCol = col + dc;
        if (inside(simpleRow, simpleCol) && board[simpleRow][simpleCol] === null) {
          moves.push({ from: { row, col }, to: { row: simpleRow, col: simpleCol }, captured: [] });
        }

        const jumpRow = row + dr * 2;
        const jumpCol = col + dc * 2;
        const middleRow = row + dr;
        const middleCol = col + dc;
        if (inside(jumpRow, jumpCol) && board[jumpRow][jumpCol] === null) {
          const middlePiece = board[middleRow][middleCol];
          if (middlePiece && middlePiece.player !== player) {
            moves.push({
              from: { row, col },
              to: { row: jumpRow, col: jumpCol },
              captured: [{ row: middleRow, col: middleCol }]
            });
          }
        }
      }
    }
  }

  const captures = moves.filter((move) => move.captured.length > 0);
  return captures.length > 0 ? captures : moves;
}

export function applyMoveLocal(board: BoardState, move: MoveCandidate): BoardState {
  const copy = board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));
  const piece = copy[move.from.row][move.from.col];
  if (!piece) return copy;

  copy[move.from.row][move.from.col] = null;
  for (const captured of move.captured) {
    copy[captured.row][captured.col] = null;
  }

  if (piece.player === "ai" && move.to.row === 7) piece.king = true;
  if (piece.player === "human" && move.to.row === 0) piece.king = true;

  copy[move.to.row][move.to.col] = piece;
  return copy;
}

export function samePosition(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

export function findMove(board: BoardState, player: PlayerType, from: Position, to: Position): MoveCandidate | undefined {
  return legalMovesFor(board, player).find((move) => samePosition(move.from, from) && samePosition(move.to, to));
}

export function countPieces(board: BoardState, player: PlayerType): number {
  return board.flat().filter((piece) => piece?.player === player).length;
}
