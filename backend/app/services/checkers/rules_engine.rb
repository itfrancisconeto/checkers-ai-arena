module Checkers
  class RulesEngine
    DIRECTIONS = {
      "human" => [[-1, -1], [-1, 1]],
      "ai" => [[1, -1], [1, 1]]
    }.freeze

    def initialize(board)
      @board = board
    end

    def legal_moves_for(player)
      moves = []

      (0..7).each do |row|
        (0..7).each do |col|
          piece = @board[row][col]
          next unless piece && piece["player"] == player

          directions_for(piece).each do |dr, dc|
            simple_row = row + dr
            simple_col = col + dc
            if inside?(simple_row, simple_col) && @board[simple_row][simple_col].nil?
              moves << move_hash(row, col, simple_row, simple_col, [])
            end

            jump_row = row + (dr * 2)
            jump_col = col + (dc * 2)
            middle_row = row + dr
            middle_col = col + dc
            if inside?(jump_row, jump_col) && @board[jump_row][jump_col].nil?
              middle_piece = @board[middle_row][middle_col]
              if middle_piece && middle_piece["player"] != player
                moves << move_hash(row, col, jump_row, jump_col, [{ row: middle_row, col: middle_col }])
              end
            end
          end
        end
      end

      captures = moves.select { |move| move[:captured].any? }
      captures.any? ? captures : moves
    end

    def apply_move(player:, from:, to:)
      from = normalize_position(from)
      to = normalize_position(to)
      move = legal_moves_for(player).find do |candidate|
        candidate[:from] == from && candidate[:to] == to
      end

      raise ArgumentError, "Movimento inválido" unless move

      new_board = deep_copy(@board)
      piece = new_board[from[:row]][from[:col]]
      new_board[from[:row]][from[:col]] = nil

      move[:captured].each do |captured|
        new_board[captured[:row]][captured[:col]] = nil
      end

      if piece["player"] == "human" && to[:row] == 0
        piece["king"] = true
      elsif piece["player"] == "ai" && to[:row] == 7
        piece["king"] = true
      end

      new_board[to[:row]][to[:col]] = piece

      {
        board: new_board,
        move: move,
        status: status_for(new_board)
      }
    end

    private

    def directions_for(piece)
      return DIRECTIONS["human"] + DIRECTIONS["ai"] if piece["king"]

      DIRECTIONS[piece["player"]]
    end

    def status_for(board)
      counts = Checkers::Board.piece_counts(board)
      return { status: "ai_won", winner: "ai" } if counts[:human].zero?
      return { status: "player_won", winner: "human" } if counts[:ai].zero?
      return { status: "player_won", winner: "human" } if self.class.new(board).legal_moves_for("ai").empty?
      return { status: "ai_won", winner: "ai" } if self.class.new(board).legal_moves_for("human").empty?

      { status: "in_progress", winner: nil }
    end

    def move_hash(from_row, from_col, to_row, to_col, captured)
      {
        from: { row: from_row, col: from_col },
        to: { row: to_row, col: to_col },
        captured: captured
      }
    end

    def normalize_position(position)
      {
        row: position["row"] || position[:row],
        col: position["col"] || position[:col]
      }
    end

    def inside?(row, col)
      row.between?(0, 7) && col.between?(0, 7)
    end

    def deep_copy(value)
      JSON.parse(JSON.generate(value))
    end
  end
end
