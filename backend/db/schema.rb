# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_06_10_000400) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "ai_snapshots", force: :cascade do |t|
    t.string "name", null: false
    t.jsonb "weights_json", null: false
    t.integer "training_games_count", default: 0, null: false
    t.integer "experiences_count", default: 0, null: false
    t.float "average_reward", default: 0.0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "ai_training_events", force: :cascade do |t|
    t.bigint "game_id"
    t.float "reward", default: 0.0, null: false
    t.float "confidence", default: 0.0, null: false
    t.float "exploration_rate", default: 0.0, null: false
    t.string "mode", default: "exploring", null: false
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["game_id"], name: "index_ai_training_events_on_game_id"
  end

  create_table "games", force: :cascade do |t|
    t.jsonb "board_state", null: false
    t.string "status", default: "in_progress", null: false
    t.string "current_turn", default: "human", null: false
    t.string "winner"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "moves", force: :cascade do |t|
    t.bigint "game_id", null: false
    t.string "player_type", null: false
    t.jsonb "from_position", null: false
    t.jsonb "to_position", null: false
    t.jsonb "captured_positions", default: [], null: false
    t.jsonb "board_before", null: false
    t.jsonb "board_after", null: false
    t.float "reward", default: 0.0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["game_id"], name: "index_moves_on_game_id"
  end

  add_foreign_key "ai_training_events", "games"
  add_foreign_key "moves", "games"
end
