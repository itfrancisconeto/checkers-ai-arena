module Checkers
  class Board
    def self.initial_state
      board = Array.new(8) { Array.new(8) }

      (0..2).each do |row|
        (0..7).each do |col|
          board[row][col] = { "player" => "ai", "king" => false } if playable_square?(row, col)
        end
      end

      (5..7).each do |row|
        (0..7).each do |col|
          board[row][col] = { "player" => "human", "king" => false } if playable_square?(row, col)
        end
      end

      board
    end

    def self.playable_square?(row, col)
      (row + col).odd?
    end

    def self.piece_counts(board)
      human = 0
      ai = 0

      board.each do |row|
        row.each do |piece|
          next unless piece
          piece["player"] == "human" ? human += 1 : ai += 1
        end
      end

      { human: human, ai: ai }
    end
  end
end
