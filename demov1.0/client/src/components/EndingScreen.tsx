import React from 'react';
import { GameEnding } from '../types/game.types';

interface EndingScreenProps {
  ending: GameEnding;
  onRestart: () => void;
}

const endingTitles: Record<string, string> = {
  ascension: '白日飞升',
  death: '身死道消',
  lifespan: '寿终正寝',
};

const endingIcons: Record<string, string> = {
  ascension: '✦',
  death: '☠',
  lifespan: '☯',
};

export function EndingScreen({ ending, onRestart }: EndingScreenProps) {
  return (
    <div className="ending-screen">
      <div className="ending-icon">{endingIcons[ending.type] || '✦'}</div>
      <h2 className="ending-title">{endingTitles[ending.type] || '结局'}</h2>
      <p className="ending-narrative">{ending.narrative}</p>
      <p className="ending-summary">{ending.summary}</p>
      <button className="restart-button" onClick={onRestart}>
        重新开始
      </button>
    </div>
  );
}
