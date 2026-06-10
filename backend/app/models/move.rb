class Move < ApplicationRecord
  belongs_to :game

  validates :player_type, :from_position, :to_position, :board_before, :board_after, presence: true
end
