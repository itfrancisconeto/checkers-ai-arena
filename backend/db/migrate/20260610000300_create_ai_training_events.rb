class CreateAiTrainingEvents < ActiveRecord::Migration[8.0]
  def change
    create_table :ai_training_events do |t|
      t.references :game, null: true, foreign_key: true
      t.float :reward, null: false, default: 0.0
      t.float :confidence, null: false, default: 0.0
      t.float :exploration_rate, null: false, default: 0.0
      t.string :mode, null: false, default: "exploring"
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
    end
  end
end
