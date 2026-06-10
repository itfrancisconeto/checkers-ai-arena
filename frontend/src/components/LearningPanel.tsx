import { BrainCircuit, RefreshCcw, Sparkles, Gauge } from "lucide-react";
import type { LearningStats } from "../types";

type Props = {
  stats: LearningStats;
  onReset: () => void;
};

export function LearningPanel({ stats, onReset }: Props) {
  const confidence = Math.round(stats.confidence * 100);
  const exploration = Math.round(stats.explorationRate * 100);
  const maxAbsReward = Math.max(10, ...stats.rewardHistory.map((value) => Math.abs(value)));

  return (
    <section className="panel learning-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">IA local</p>
          <h2>Aprendizado incremental</h2>
        </div>
        <BrainCircuit size={25} />
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <Sparkles size={16} />
          <span>Experiências</span>
          <strong>{stats.experiences}</strong>
        </div>
        <div className="stat-card">
          <Gauge size={16} />
          <span>Confiança</span>
          <strong>{confidence}%</strong>
        </div>
      </div>

      <div className="metric-block">
        <div className="metric-title">
          <span>Exploração</span>
          <strong>{exploration}%</strong>
        </div>
        <div className="progress"><span style={{ width: `${exploration}%` }} /></div>
        <small>Quanto menor a exploração, mais a IA está usando padrões aprendidos em vez de testar jogadas aleatórias.</small>
      </div>

      <div className="explain-card">
        <span>Modo atual</span>
        <strong>{stats.mode}</strong>
        <small>Última recompensa: {stats.lastReward.toFixed(1)}</small>
        <small>Recompensa acumulada: {stats.accumulatedReward.toFixed(1)}</small>
      </div>

      <div className="chart-card">
        <strong>Curva de recompensa</strong>
        <div className="reward-chart">
          {stats.rewardHistory.length === 0 ? (
            <span className="empty-chart" />
          ) : (
            stats.rewardHistory.map((reward, index) => {
              const height = Math.max(6, Math.abs(reward) / maxAbsReward * 70);
              return (
                <span
                  key={`${reward}-${index}`}
                  className={`bar ${reward >= 0 ? "positive" : "negative"}`}
                  style={{ height: `${height}%` }}
                  title={`Recompensa ${reward.toFixed(1)}`}
                />
              );
            })
          )}
        </div>
      </div>

      <div className="timeline">
        <strong>Linha do tempo</strong>
        {stats.timeline.length === 0 ? (
          <p>A IA começará a aprender após sua primeira jogada.</p>
        ) : (
          <ul>
            {stats.timeline.slice(-6).map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
          </ul>
        )}
      </div>

      <button className="secondary-button" onClick={onReset}>
        <RefreshCcw size={14} /> Resetar aprendizado local
      </button>
    </section>
  );
}
