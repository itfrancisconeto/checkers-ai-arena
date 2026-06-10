class CreateAiSnapshots < ActiveRecord::Migration[8.0]
  def change
    create_table :ai_snapshots do |t|
      t.string :name, null: false
      t.jsonb :weights_json, null: false
      t.integer :training_games_count, null: false, default: 0
      t.integer :experiences_count, null: false, default: 0
      t.float :average_reward, null: false, default: 0.0

      t.timestamps
    end
  end
end
