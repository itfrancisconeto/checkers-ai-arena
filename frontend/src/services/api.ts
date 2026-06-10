import type { Game, Position } from "../types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    let message = `Erro HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.error || message;
    } catch {
      // ignore json parse error
    }
    throw new Error(message);
  }

  return response.json();
}

export async function createGame(): Promise<Game> {
  return request<Game>("/api/v1/games", { method: "POST", body: JSON.stringify({}) });
}

export async function playMove(
  gameId: number,
  playerType: "human" | "ai",
  from: Position,
  to: Position,
  reward = 0
): Promise<Game> {
  return request<Game>(`/api/v1/games/${gameId}/play`, {
    method: "POST",
    body: JSON.stringify({ player_type: playerType, from, to, reward })
  });
}

export async function sendTrainingEvent(payload: Record<string, unknown>): Promise<void> {
  await request("/api/v1/ai/training_events", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
