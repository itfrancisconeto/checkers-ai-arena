class GameSerializer
  def initialize(game)
    @game = game
  end

  def as_json(*)
    {
      id: @game.id,
      board_state: @game.board_state,
      status: @game.status,
      current_turn: @game.current_turn,
      winner: @game.winner,
      moves: @game.moves.order(:created_at).map do |move|
        {
          id: move.id,
          player_type: move.player_type,
          from_position: move.from_position,
          to_position: move.to_position,
          captured_positions: move.captured_positions,
          reward: move.reward,
          created_at: move.created_at
        }
      end,
      created_at: @game.created_at,
      updated_at: @game.updated_at
    }
  end
end
