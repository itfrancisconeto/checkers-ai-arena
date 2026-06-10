module Api
  module V1
    module Ai
      class TrainingEventsController < ApplicationController
        def create
          event = AiTrainingEvent.create!(
            game_id: params[:game_id],
            reward: params[:reward].to_f,
            confidence: params[:confidence].to_f,
            exploration_rate: params[:exploration_rate].to_f,
            mode: params[:mode].presence || "exploring",
            metadata: params[:metadata] || {}
          )

          render json: event, status: :created
        end
      end
    end
  end
end
