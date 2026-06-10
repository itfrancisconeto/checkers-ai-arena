module Api
  module V1
    module Ai
      class StatsController < ApplicationController
        def show
          events = AiTrainingEvent.order(created_at: :desc).limit(200)
          render json: {
            games_played: Game.where.not(status: "in_progress").count,
            games_in_progress: Game.where(status: "in_progress").count,
            experiences: AiTrainingEvent.count,
            snapshots: AiSnapshot.count,
            average_reward: events.any? ? events.average(:reward).to_f.round(2) : 0.0,
            latest_event: events.first&.as_json(only: [:reward, :confidence, :exploration_rate, :mode, :created_at])
          }
        end
      end
    end
  end
end
