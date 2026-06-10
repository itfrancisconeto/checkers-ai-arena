import type { BoardState, MoveCandidate, Position } from "../types";
import { legalMovesFor, samePosition } from "../ai/rules";

type Props = {
  board: BoardState;
  selected: Position | null;
  onSelect: (position: Position) => void;
  disabled: boolean;
};

export function CheckersBoard({ board, selected, onSelect, disabled }: Props) {
  const humanMoves = legalMovesFor(board, "human");

  function isDestination(position: Position): boolean {
    if (!selected) return false;
    return humanMoves.some((move: MoveCandidate) => samePosition(move.from, selected) && samePosition(move.to, position));
  }

  return (
    <div className="board" aria-label="Tabuleiro de damas">
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const dark = (rowIndex + colIndex) % 2 === 1;
          const position = { row: rowIndex, col: colIndex };
          const isSelected = selected && samePosition(selected, position);
          const possible = isDestination(position);

          return (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`square ${dark ? "dark" : "light"} ${isSelected ? "selected" : ""} ${possible ? "possible" : ""}`}
              onClick={() => !disabled && onSelect(position)}
              disabled={disabled || !dark}
            >
              {piece && (
                <span className={`piece ${piece.player} ${piece.king ? "king" : ""}`}>
                  {piece.king ? "♛" : "●"}
                </span>
              )}
            </button>
          );
        })
      )}
    </div>
  );
}
