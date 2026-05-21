import React from 'react';
import { GameCharacter, CharacterStats } from '../types/game.types';

interface StatusBarProps {
  character: GameCharacter | null;
  storyPhase: string;
  stats: CharacterStats;
  onTogglePanel: () => void;
  isPanelOpen: boolean;
}

const phaseLabels: Record<string, string> = {
  intro: '序章',
  early: '前期',
  mid: '中期',
  late: '后期',
  ending: '终章',
};

export function StatusBar({
  character,
  storyPhase,
  stats,
  onTogglePanel,
  isPanelOpen,
}: StatusBarProps) {
  if (!character) return null;

  const cultivationPct = Math.min(100, stats.cultivation);
  const hpPct = Math.min(100, stats.hp);

  return (
    <div className="status-bar">
      <div className="status-left">
        <span className="status-name">{character.name}</span>
        <span className="status-divider">·</span>
        <span className="status-realm">{character.realm}</span>
        <span className="status-divider">·</span>
        <span className="status-phase">{phaseLabels[storyPhase] || storyPhase}</span>
      </div>

      <div className="status-mini-bars">
        <div className="mini-bar-item" title={`生命：${stats.hp}/100`}>
          <span className="mini-bar-label" style={{ color: '#ef5b5b' }}>命</span>
          <div className="mini-bar-bg">
            <div className="mini-bar-fill" style={{ width: `${hpPct}%`, background: '#ef5b5b' }} />
          </div>
        </div>
        <div className="mini-bar-item" title={`修炼：${stats.cultivation}/100`}>
          <span className="mini-bar-label" style={{ color: '#7b6cf6' }}>炼</span>
          <div className="mini-bar-bg">
            <div
              className="mini-bar-fill"
              style={{
                width: `${cultivationPct}%`,
                background: cultivationPct >= 80 ? '#f0a050' : '#7b6cf6',
              }}
            />
          </div>
        </div>
      </div>

      <button
        className={`panel-toggle-btn ${isPanelOpen ? 'active' : ''}`}
        onClick={onTogglePanel}
        title="角色属性"
      >
        <span className="panel-toggle-icon">⚔</span>
        <span>属性</span>
      </button>
    </div>
  );
}
