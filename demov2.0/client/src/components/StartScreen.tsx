import React from 'react';
import { useGameStore } from '../store/useGameStore';
import './StartScreen.css';

export function StartScreen() {
  const { rollCharacter, isLoading } = useGameStore();

  return (
    <div className="start-screen">
      <div className="start-content">
        <h1 className="start-title">文字修仙</h1>
        <p className="start-subtitle">三Agent驱动 · AI叙事架构 · Demo v2.0</p>
        <div className="start-desc">
          <p>在这片灵气充裕的修仙世界中，你将扮演一名散修，</p>
          <p>历经磨难，探索机缘，追寻大道之巅。</p>
        </div>
        <button
          className="btn btn-primary start-btn"
          onClick={rollCharacter}
          disabled={isLoading}
        >
          {isLoading ? '正在起卦...' : '开始修行'}
        </button>
        <div className="start-features">
          <span className="feature-tag">三Agent协作生成</span>
          <span className="feature-tag">SSE实时推送</span>
          <span className="feature-tag">精/气/神三维属性</span>
          <span className="feature-tag">8种节点类型</span>
          <span className="feature-tag">战斗概率模型</span>
          <span className="feature-tag">境界突破天劫</span>
        </div>
      </div>
    </div>
  );
}
