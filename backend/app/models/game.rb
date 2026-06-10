class Game < ApplicationRecord
  has_many :moves, dependent: :destroy

  validates :board_state, presence: true
  validates :status, presence: true
  validates :current_turn, presence: true
end
