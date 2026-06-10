class CreateGames < ActiveRecord::Migration[8.0]
  def change
    create_table :games do |t|
      t.jsonb :board_state, null: false
      t.string :status, null: false, default: "in_progress"
      t.string :current_turn, null: false, default: "human"
      t.string :winner

      t.timestamps
    end
  end
end
