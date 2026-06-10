class AiSnapshot < ApplicationRecord
  validates :name, presence: true
  validates :weights_json, presence: true
end
