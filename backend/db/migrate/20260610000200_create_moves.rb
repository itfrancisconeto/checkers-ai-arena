class CreateMoves < ActiveRecord::Migration[8.0]
  def change
    create_table :moves do |t|
      t.references :game, null: false, foreign_key: true
      t.string :player_type, null: false
      t.jsonb :from_position, null: false
      t.jsonb :to_position, null: false
      t.jsonb :captured_positions, null: false, default: []
      t.jsonb :board_before, null: false
      t.jsonb :board_after, null: false
      t.float :reward, null: false, default: 0.0

      t.timestamps
    end
  end
end
