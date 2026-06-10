module Api
  module V1
    class GamesController < ApplicationController
      rescue_from ArgumentError, with: :render_unprocessable
      rescue_from ActiveRecord::RecordNotFound, with: :render_not_found

      def index
        games = Game.order(created_at: :desc).limit(20)
        render json: games.map { |game| GameSerializer.new(game).as_json }
      end

      def create
        game = Game.create!(
          board_state: Checkers::Board.initial_state,
          status: "in_progress",
          current_turn: "human"
        )

        render json: GameSerializer.new(game).as_json, status: :created
      end

      def show
        render json: GameSerializer.new(Game.find(params[:id])).as_json
      end

      def play
        game = Game.find(params[:id])
        player = params[:player_type].presence || params[:player].presence || game.current_turn
        raise ArgumentError, "Jogador inválido" unless %w[human ai].include?(player)
        raise ArgumentError, "A partida já terminou" unless game.status == "in_progress"

        from_position = normalize_position_param(params.require(:from))
        to_position = normalize_position_param(params.require(:to))
        board_before = game.board_state
        result = Checkers::RulesEngine.new(board_before).apply_move(
          player: player,
          from: from_position,
          to: to_position
        )

        next_turn = player == "human" ? "ai" : "human"
        game.update!(
          board_state: result[:board],
          status: result[:status][:status],
          winner: result[:status][:winner],
          current_turn: result[:status][:status] == "in_progress" ? next_turn : "finished"
        )

        game.moves.create!(
          player_type: player,
          from_position: from_position,
          to_position: to_position,
          captured_positions: result[:move][:captured],
          board_before: board_before,
          board_after: result[:board],
          reward: params[:reward].to_f
        )

        render json: GameSerializer.new(game.reload).as_json
      end

      def finish
        game = Game.find(params[:id])
        game.update!(status: params[:status] || "draw", winner: params[:winner], current_turn: "finished")
        render json: GameSerializer.new(game).as_json
      end

      private

      def normalize_position_param(value)
        hash = value.respond_to?(:to_unsafe_h) ? value.to_unsafe_h : value.to_h
        { row: hash["row"].to_i, col: hash["col"].to_i }
      end

      def render_unprocessable(error)
        render json: { error: error.message }, status: :unprocessable_entity
      end

      def render_not_found
        render json: { error: "Partida não encontrada" }, status: :not_found
      end
    end
  end
end
