import * as tf from "@tensorflow/tfjs";
import type { BoardState, MoveCandidate } from "../types";
import { applyMoveLocal, legalMovesFor } from "./rules";

const MODEL_URL = "localstorage://checkers-ai-browser-model";

function encodeBoard(board: BoardState): number[] {
  const values: number[] = [];

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      if ((row + col) % 2 === 0) continue;
      const piece = board[row][col];
      if (!piece) values.push(0);
      else if (piece.player === "human" && !piece.king) values.push(1);
      else if (piece.player === "human" && piece.king) values.push(2);
      else if (piece.player === "ai" && !piece.king) values.push(-1);
      else values.push(-2);
    }
  }

  return values;
}

function createModel(): tf.LayersModel {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [32], units: 64, activation: "relu" }));
  model.add(tf.layers.dense({ units: 32, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1, activation: "linear" }));
  model.compile({ optimizer: tf.train.adam(0.001), loss: "meanSquaredError" });
  return model;
}

export type AgentDecision = {
  move: MoveCandidate;
  confidence: number;
  explorationRate: number;
  exploring: boolean;
  predictedScore: number;
};

export class DeepQAgent {
  private model: tf.LayersModel | null = null;
  private explorationRate = 0.75;
  private experiences = 0;

  async init(): Promise<void> {
    try {
      this.model = await tf.loadLayersModel(MODEL_URL);
      this.model.compile({ optimizer: tf.train.adam(0.001), loss: "meanSquaredError" });
    } catch {
      this.model = createModel();
    }

    const savedExploration = localStorage.getItem("checkers-ai-exploration-rate");
    const savedExperiences = localStorage.getItem("checkers-ai-experiences");
    this.explorationRate = savedExploration ? Number(savedExploration) : 0.75;
    this.experiences = savedExperiences ? Number(savedExperiences) : 0;
  }

  getExperienceCount(): number {
    return this.experiences;
  }

  getExplorationRate(): number {
    return this.explorationRate;
  }

  async decide(board: BoardState): Promise<AgentDecision | null> {
    if (!this.model) await this.init();
    if (!this.model) return null;

    const moves = legalMovesFor(board, "ai");
    if (moves.length === 0) return null;

    const exploring = Math.random() < this.explorationRate;
    if (exploring) {
      const move = moves[Math.floor(Math.random() * moves.length)];
      return {
        move,
        confidence: Math.max(0.05, 1 - this.explorationRate),
        explorationRate: this.explorationRate,
        exploring,
        predictedScore: 0
      };
    }

    let best = moves[0];
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const move of moves) {
      const after = applyMoveLocal(board, move);
      const score = await this.score(after);
      if (score > bestScore) {
        bestScore = score;
        best = move;
      }
    }

    const confidence = Math.min(0.98, Math.max(0.1, Math.abs(bestScore) / 100 + (1 - this.explorationRate)));

    return {
      move: best,
      confidence,
      explorationRate: this.explorationRate,
      exploring,
      predictedScore: bestScore
    };
  }

  async train(boardAfterMove: BoardState, reward: number): Promise<void> {
    if (!this.model) await this.init();
    if (!this.model) return;

    const xs = tf.tensor2d([encodeBoard(boardAfterMove)]);
    const ys = tf.tensor2d([[reward]]);

    await this.model.fit(xs, ys, { epochs: 1, verbose: 0 });

    xs.dispose();
    ys.dispose();

    this.experiences += 1;
    this.explorationRate = Math.max(0.08, this.explorationRate * 0.985);

    localStorage.setItem("checkers-ai-exploration-rate", String(this.explorationRate));
    localStorage.setItem("checkers-ai-experiences", String(this.experiences));

    try {
      await this.model.save(MODEL_URL);
    } catch {
      // localStorage may be unavailable in private mode; the app still works in memory.
    }
  }

  async reset(): Promise<void> {
    this.model = createModel();
    this.explorationRate = 0.75;
    this.experiences = 0;
    localStorage.removeItem("checkers-ai-exploration-rate");
    localStorage.removeItem("checkers-ai-experiences");
    try {
      await tf.io.removeModel(MODEL_URL);
    } catch {
      // ignore
    }
  }

  private async score(board: BoardState): Promise<number> {
    if (!this.model) return 0;
    const input = tf.tensor2d([encodeBoard(board)]);
    const output = this.model.predict(input) as tf.Tensor;
    const data = await output.data();
    input.dispose();
    output.dispose();
    return data[0] ?? 0;
  }
}

export const aiAgent = new DeepQAgent();
