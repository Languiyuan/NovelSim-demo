import React from 'react';
import { useGameStore } from '../store/useGameStore';
import './CreateScreen.css';

export function CreateScreen() {
  const { currentRoll, confirmCharacter, rollCharacter, isLoading } = useGameStore();

  if (!currentRoll) return null;

  const totalScore = currentRoll.jing + currentRoll.qi + currentRoll.shen;
  const grade = totalScore >= 200 ? '天灵根' : totalScore >= 160 ? '异灵根' : totalScore >= 120 ? '双灵根' : '杂灵根';

  return (
    <div className="create-screen">
      <div className="create-content">
        <h2 className="create-title">角色天赋</h2>
        <p className="create-hint">天道垂青，命格已定。确认此命格，或重新起卦。</p>

        <div className="roll-card card">
          <div className="roll-name">{currentRoll.name}</div>
          <div className="roll-grade">{grade}</div>

          <div className="attrs-grid">
            <div className="attr-item">
              <span className="attr-label">精</span>
              <div className="attr-bar">
                <div className="attr-fill jing" style={{ width: `${currentRoll.jing}%` }} />
              </div>
              <span className="attr-value">{currentRoll.jing}</span>
            </div>
            <div className="attr-item">
              <span className="attr-label">气</span>
              <div className="attr-bar">
                <div className="attr-fill qi" style={{ width: `${currentRoll.qi}%` }} />
              </div>
              <span className="attr-value">{currentRoll.qi}</span>
            </div>
            <div className="attr-item">
              <span className="attr-label">神</span>
              <div className="attr-bar">
                <div className="attr-fill shen" style={{ width: `${currentRoll.shen}%` }} />
              </div>
              <span className="attr-value">{currentRoll.shen}</span>
            </div>
          </div>

          <div className="soft-attrs">
            <div className="soft-item">
              <span className="soft-label">资质</span>
              <span className="soft-value">{currentRoll.talent}</span>
            </div>
            <div className="soft-item">
              <span className="soft-label">悟性</span>
              <span className="soft-value">{currentRoll.wisdom}</span>
            </div>
            <div className="soft-item">
              <span className="soft-label">气运</span>
              <span className="soft-value">{currentRoll.luck}</span>
            </div>
            <div className="soft-item">
              <span className="soft-label">寿元</span>
              <span className="soft-value">{currentRoll.maxAge}岁</span>
            </div>
          </div>
        </div>

        <div className="create-actions">
          <button
            className="btn"
            onClick={rollCharacter}
            disabled={isLoading}
          >
            重新起卦
          </button>
          <button
            className="btn btn-primary"
            onClick={confirmCharacter}
            disabled={isLoading}
          >
            {isLoading ? '天道运转中...' : '确认此命'}
          </button>
        </div>
      </div>
    </div>
  );
}
