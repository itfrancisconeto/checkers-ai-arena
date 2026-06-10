class AiTrainingEvent < ApplicationRecord
  validates :reward, numericality: true
end
