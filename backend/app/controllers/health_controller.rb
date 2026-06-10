class HealthController < ApplicationController
  def show
    render json: { status: "ok", app: "Checkers AI Arena", time: Time.current }
  end
end
