import React from 'react';
import { CharacterData } from '../types/game.types';
import './AttributePanel.css';

interface Props {
  character: CharacterData | null;
}

export function AttributePanel({ character }: Props) {
  if (!character) return null;

  const agePercent = Math.min(100, (character.age / character.maxAge) * 100);

  return (
    <div className="attr-panel">
      <div className="attr-panel-top">
        <div className="character-info">
          <span className="character-name">{character.name}</span>
          <span className="realm-badge">{character.realm}</span>
        </div>
        <div className="age-info">
          <span className="age-text">寿元 {character.age}/{character.maxAge}</span>
        </div>
      </div>

      <div className="age-bar-container">
        <div className="age-bar" style={{ width: `${agePercent}%` }} />
      </div>

      <div className="stats-row">
        <div className="stat-item stat-jing">
          <span className="stat-label">精</span>
          <span className="stat-value">{character.jing}</span>
        </div>
        <div className="stat-item stat-qi">
          <span className="stat-label">气</span>
          <span className="stat-value">{character.qi}</span>
        </div>
        <div className="stat-item stat-shen">
          <span className="stat-label">神</span>
          <span className="stat-value">{character.shen}</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item stat-exp">
          <span className="stat-label">经验</span>
          <span className="stat-value">{character.exp}</span>
        </div>
        <div className="stat-item stat-luck">
          <span className="stat-label">气运</span>
          <span className="stat-value">{character.luck}</span>
        </div>
      </div>
    </div>
  );
}
