module Api
  module V1
    module Ai
      class SnapshotsController < ApplicationController
        def create
          snapshot = AiSnapshot.create!(
            name: params[:name].presence || "browser-model",
            weights_json: params[:weights_json] || {},
            training_games_count: params[:training_games_count].to_i,
            experiences_count: params[:experiences_count].to_i,
            average_reward: params[:average_reward].to_f
          )

          render json: snapshot, status: :created
        end

        def latest
          snapshot = AiSnapshot.order(created_at: :desc).first
          if snapshot
            render json: snapshot
          else
            render json: { error: "Nenhum snapshot encontrado" }, status: :not_found
          end
        end

        def destroy_all
          AiSnapshot.delete_all
          AiTrainingEvent.delete_all
          render json: { status: "ok" }
        end
      end
    end
  end
end
