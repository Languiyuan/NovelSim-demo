import React from 'react';
import { useGameStore } from '../store/useGameStore';
import './EndingScreen.css';

export function EndingScreen() {
  const { ending, character, narrativeHistory, resetGame } = useGameStore();

  if (!ending) return null;

  const endingLabels: Record<string, { title: string; color: string }> = {
    ascension: { title: '飞升仙界', color: 'var(--accent)' },
    death: { title: '陨落凡间', color: 'var(--red)' },
    lifespan: { title: '寿尽坐化', color: 'var(--orange)' },
  };

  const info = endingLabels[ending.type] || endingLabels.lifespan;

  return (
    <div className="ending-screen">
      <div className="ending-content">
        <div className="ending-badge" style={{ color: info.color, borderColor: info.color }}>
          {info.title}
        </div>

        <div className="ending-narrative">{ending.narrative}</div>

        {ending.summary && (
          <div className="ending-summary">{ending.summary}</div>
        )}

        {character && (
          <div className="ending-stats card">
            <div className="stat-row">
              <span>最终境界</span>
              <span className="stat-highlight">{character.realm}</span>
            </div>
            <div className="stat-row">
              <span>修行年限</span>
              <span>{character.age}年</span>
            </div>
            <div className="stat-row">
              <span>精/气/神</span>
              <span>{character.jing}/{character.qi}/{character.shen}</span>
            </div>
            <div className="stat-row">
              <span>经历节点</span>
              <span>{narrativeHistory.length}个</span>
            </div>
          </div>
        )}

        <button className="btn btn-primary" onClick={resetGame}>
          再入轮回
        </button>
      </div>
    </div>
  );
}
