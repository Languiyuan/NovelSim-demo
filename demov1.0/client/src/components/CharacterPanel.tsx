import React, { useEffect, useRef, useState } from 'react';
import { CharacterStats, AttributeChanges } from '../types/game.types';

interface StatDelta {
  key: string;
  delta: number;
  id: number;
}

interface Props {
  stats: CharacterStats;
  lastChanges: AttributeChanges | null;
  character: { name: string; realm: string } | null;
  isOpen: boolean;
  onClose: () => void;
}

const STAT_CONFIG = [
  { key: 'hp', label: '生命', color: '#ef5b5b', bg: 'rgba(239,91,91,0.15)' },
  { key: 'mp', label: '灵力', color: '#5b9cf5', bg: 'rgba(91,156,245,0.15)' },
  { key: 'atk', label: '攻击', color: '#f0a050', bg: 'rgba(240,160,80,0.15)' },
  { key: 'def', label: '防御', color: '#56d4c8', bg: 'rgba(86,212,200,0.15)' },
  { key: 'luck', label: '气运', color: '#bc8cff', bg: 'rgba(188,140,255,0.15)' },
] as const;

let deltaIdCounter = 0;

export function CharacterPanel({ stats, lastChanges, character, isOpen, onClose }: Props) {
  const [deltas, setDeltas] = useState<StatDelta[]>([]);
  const prevChangesRef = useRef<AttributeChanges | null>(null);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  // 当属性变化时触发动画
  useEffect(() => {
    if (!lastChanges || lastChanges === prevChangesRef.current) return;
    prevChangesRef.current = lastChanges;

    const newDeltas: StatDelta[] = [];
    STAT_CONFIG.forEach(({ key }) => {
      const delta = (lastChanges as any)[key];
      if (delta && delta !== 0) {
        newDeltas.push({ key, delta, id: ++deltaIdCounter });
      }
    });

    if (newDeltas.length > 0) {
      setDeltas((prev) => [...prev, ...newDeltas]);
      setTimeout(() => {
        setDeltas((prev) => prev.filter((d) => !newDeltas.find((nd) => nd.id === d.id)));
      }, 1800);
    }

    // 标记新成就
    if (lastChanges.achievements && lastChanges.achievements.length > 0) {
      setNewAchievements(lastChanges.achievements);
      setTimeout(() => setNewAchievements([]), 3000);
    }
  }, [lastChanges]);

  const cultivationPct = Math.max(0, Math.min(100, stats.cultivation));
  const isNearBreakthrough = cultivationPct >= 80;

  return (
    <>
      {/* 遮罩 */}
      <div
        className={`panel-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      {/* 面板主体 */}
      <aside className={`character-panel ${isOpen ? 'open' : ''}`}>
        <div className="panel-inner">
          {/* 头部 */}
          <div className="panel-header">
            <button className="panel-close" onClick={onClose}>✕</button>
            <div className="panel-avatar">
              <span className="panel-avatar-icon">修</span>
            </div>
            <div className="panel-identity">
              <div className="panel-name">{character?.name || '李青云'}</div>
              <div className="panel-realm">{character?.realm || '练气中期'}</div>
            </div>
          </div>

          {/* 修炼进度 */}
          <div className="cultivation-section">
            <div className="cultivation-label">
              <span>修炼进度</span>
              {isNearBreakthrough && (
                <span className="breakthrough-hint">即将突破！</span>
              )}
              <span className="cultivation-value">{cultivationPct}/100</span>
            </div>
            <div className="cultivation-bar-bg">
              <div
                className={`cultivation-bar-fill ${isNearBreakthrough ? 'pulsing' : ''}`}
                style={{ width: `${cultivationPct}%` }}
              />
            </div>
          </div>

          {/* 属性列表 */}
          <div className="stats-section">
            {STAT_CONFIG.map(({ key, label, color, bg }) => {
              const value = (stats as any)[key] as number;
              const activeDelta = deltas.find((d) => d.key === key);

              return (
                <div key={key} className="stat-row">
                  <span className="stat-label" style={{ color }}>{label}</span>
                  <div className="stat-bar-wrap">
                    <div
                      className="stat-bar-bg"
                      style={{ background: bg }}
                    >
                      <div
                        className="stat-bar-fill"
                        style={{ width: `${value}%`, background: color }}
                      />
                    </div>
                  </div>
                  <div className="stat-value-wrap">
                    <span className="stat-value">{value}</span>
                    {activeDelta && (
                      <span
                        className={`stat-delta ${activeDelta.delta > 0 ? 'positive' : 'negative'}`}
                        key={activeDelta.id}
                      >
                        {activeDelta.delta > 0 ? `+${activeDelta.delta}` : activeDelta.delta}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 成就标签 */}
          <div className="achievements-section">
            <div className="achievements-title">修仙历程</div>
            {stats.achievements.length === 0 ? (
              <div className="achievements-empty">尚无特殊成就</div>
            ) : (
              <div className="achievements-grid">
                {stats.achievements.map((tag, i) => (
                  <span
                    key={i}
                    className={`achievement-tag ${newAchievements.includes(tag) ? 'new' : ''}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
