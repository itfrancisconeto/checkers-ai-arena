import { useEffect, useMemo, useState } from "react";
import { CheckersBoard } from "./components/CheckersBoard";
import { LearningPanel } from "./components/LearningPanel";
import { aiAgent } from "./ai/deepQAgent";
import { applyMoveLocal, findMove } from "./ai/rules";
import { calculateReward } from "./ai/reward";
import { createGame, playMove, sendTrainingEvent } from "./services/api";
import type { Game, LearningStats, Position } from "./types";
import "./styles.css";

const initialStats: LearningStats = {
  experiences: 0,
  confidence: 0,
  explorationRate: 0.75,
  lastReward: 0,
  accumulatedReward: 0,
  mode: "Explorando jogadas",
  timeline: [],
  rewardHistory: []
};

function formatMove(from: Position, to: Position): string {
  return `(${from.row + 1}, ${from.col + 1}) → (${to.row + 1}, ${to.col + 1})`;
}

export default function App() {
  const [game, setGame] = useState<Game | null>(null);
  const [selected, setSelected] = useState<Position | null>(null);
  const [message, setMessage] = useState("Clique em Nova partida para começar.");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<LearningStats>(initialStats);

  useEffect(() => {
    aiAgent.init().then(() => {
      setStats((current) => ({
        ...current,
        experiences: aiAgent.getExperienceCount(),
        explorationRate: aiAgent.getExplorationRate()
      }));
    });
  }, []);

  const boardDisabled = useMemo(() => loading || !game || game.status !== "in_progress" || game.current_turn !== "human", [loading, game]);

  async function handleNewGame() {
    setLoading(true);
    setSelected(null);
    setMessage("Criando partida...");
    try {
      const created = await createGame();
      setGame(created);
      setMessage("Sua vez. Selecione uma peça e depois o destino.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao criar partida.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePositionClick(position: Position) {
    if (!game || boardDisabled) return;

    const piece = game.board_state[position.row][position.col];

    if (!selected) {
      if (piece?.player === "human") {
        setSelected(position);
        setMessage("Agora selecione o destino da jogada.");
      }
      return;
    }

    if (piece?.player === "human") {
      setSelected(position);
      return;
    }

    const humanMove = findMove(game.board_state, "human", selected, position);
    if (!humanMove) {
      setMessage("Movimento inválido para esta peça.");
      setSelected(null);
      return;
    }

    setLoading(true);
    try {
      const afterHuman = await playMove(game.id, "human", humanMove.from, humanMove.to, 0);
      setGame(afterHuman);
      setSelected(null);

      if (afterHuman.status !== "in_progress") {
        setMessage("Você venceu a partida.");
        return;
      }

      setMessage("IA pensando...");
      await new Promise((resolve) => setTimeout(resolve, 350));

      const decision = await aiAgent.decide(afterHuman.board_state);
      if (!decision) {
        setMessage("A IA ficou sem jogadas. Você venceu!");
        return;
      }

      const predictedBoard = applyMoveLocal(afterHuman.board_state, decision.move);
      const reward = calculateReward(afterHuman.board_state, predictedBoard, decision.move);
      await aiAgent.train(predictedBoard, reward);

      const afterAi = await playMove(afterHuman.id, "ai", decision.move.from, decision.move.to, reward);
      setGame(afterAi);

      const mode = decision.exploring ? "Explorando jogadas" : "Usando experiência aprendida";
      const timelineItem = decision.exploring
        ? `IA testou ${formatMove(decision.move.from, decision.move.to)} e recebeu ${reward.toFixed(1)} pontos.`
        : `IA usou experiência em ${formatMove(decision.move.from, decision.move.to)} e recebeu ${reward.toFixed(1)} pontos.`;

      setStats((current) => ({
        experiences: aiAgent.getExperienceCount(),
        confidence: decision.confidence,
        explorationRate: aiAgent.getExplorationRate(),
        lastReward: reward,
        accumulatedReward: current.accumulatedReward + reward,
        mode,
        timeline: [...current.timeline, timelineItem, "Rede neural atualizada localmente no navegador."],
        rewardHistory: [...current.rewardHistory, reward].slice(-24)
      }));

      sendTrainingEvent({
        game_id: afterAi.id,
        reward,
        confidence: decision.confidence,
        exploration_rate: aiAgent.getExplorationRate(),
        mode: decision.exploring ? "exploring" : "learned",
        metadata: { move: decision.move, predicted_score: decision.predictedScore }
      }).catch(() => undefined);

      if (afterAi.status === "ai_won") setMessage("A IA venceu a partida.");
      else if (afterAi.status === "player_won") setMessage("Você venceu a partida.");
      else setMessage("Sua vez.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro durante a jogada.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetLearning() {
    await aiAgent.reset();
    setStats(initialStats);
    setMessage("Aprendizado local resetado. A IA voltou a explorar mais.");
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p>Ruby on Rails · React SPA · Docker · IA local</p>
          <h1>Checkers AI Arena</h1>
          <span>Jogue damas contra uma rede neural leve que aprende por reforço incremental diretamente no navegador.</span>
        </div>
        <strong>MVC + SPA</strong>
      </section>

      <div className="layout">
        <aside className="panel status-panel">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">Partida</p>
              <h2>Status do jogo</h2>
            </div>
            <button className="primary-button" onClick={handleNewGame} disabled={loading}>{loading ? "Aguarde..." : "Nova partida"}</button>
          </div>

          <div className="message-card">
            <span>Mensagem</span>
            <strong>{message}</strong>
            <small>Status: {game?.status ?? "sem partida"}</small>
            <small>Turno: {game?.current_turn === "human" ? "Você" : game?.current_turn === "ai" ? "IA" : "-"}</small>
          </div>

          <div className="history">
            <strong>Histórico de jogadas</strong>
            {game?.moves?.length ? (
              <ol>
                {game.moves.slice(-10).map((move) => (
                  <li key={move.id}>
                    {move.player_type === "human" ? "Você" : "IA"}: {formatMove(move.from_position, move.to_position)}
                  </li>
                ))}
              </ol>
            ) : (
              <p>Nenhuma jogada registrada.</p>
            )}
          </div>
        </aside>

        <section className="game-area">
          {game ? (
            <CheckersBoard board={game.board_state} selected={selected} onSelect={handlePositionClick} disabled={boardDisabled} />
          ) : (
            <div className="empty-board">
              <strong>Pronto para começar</strong>
              <span>Clique em Nova partida para carregar o tabuleiro.</span>
            </div>
          )}
        </section>

        <LearningPanel stats={stats} onReset={handleResetLearning} />
      </div>
    </main>
  );
}
