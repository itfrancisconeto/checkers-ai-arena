import type { BoardState, MoveCandidate } from "../types";
import { countPieces } from "./rules";

export function calculateReward(before: BoardState, after: BoardState, move: MoveCandidate): number {
  let reward = 0;

  reward += move.captured.length * 10;

  const aiPieceBefore = before[move.from.row][move.from.col];
  const aiPieceAfter = after[move.to.row][move.to.col];
  if (aiPieceBefore && aiPieceAfter && !aiPieceBefore.king && aiPieceAfter.king) {
    reward += 20;
  }

  const humanBefore = countPieces(before, "human");
  const humanAfter = countPieces(after, "human");
  const aiBefore = countPieces(before, "ai");
  const aiAfter = countPieces(after, "ai");

  reward += (humanBefore - humanAfter) * 8;
  reward -= (aiBefore - aiAfter) * 8;

  if (humanAfter === 0) reward += 100;
  if (aiAfter === 0) reward -= 100;

  return reward;
}
