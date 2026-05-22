import React from 'react';
import { GameNode } from '../types/game.types';
import './NodePanel.css';

interface Props {
  node: GameNode;
  onChoice: (index: number) => void;
  disabled: boolean;
}

const NODE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  EVENT: { label: '奇遇', color: 'var(--accent2)' },
  BATTLE: { label: '战斗', color: 'var(--red)' },
  WONDER: { label: '秘境', color: 'var(--cyan)' },
  KARMA: { label: '因果', color: 'var(--orange)' },
  FACTION: { label: '宗门', color: 'var(--green)' },
  RETREAT: { label: '闭关', color: 'var(--dim)' },
  TRIBULATION: { label: '天劫', color: 'var(--pink)' },
  ASCEND: { label: '飞升', color: 'var(--accent)' },
};

export function NodePanel({ node, onChoice, disabled }: Props) {
  const typeInfo = NODE_TYPE_LABELS[node.type] || NODE_TYPE_LABELS.EVENT;

  return (
    <div className="node-panel fade-in">
      <div className="node-header">
        <span className="node-type-badge" style={{ color: typeInfo.color, borderColor: typeInfo.color }}>
          {typeInfo.label}
        </span>
        {node.subType && <span className="node-subtype">{node.subType}</span>}
      </div>

      <div className="node-text">{node.text}</div>

      <div className="node-choices">
        {node.choices.map((choice, i) => (
          <button
            key={i}
            className="choice-btn"
            onClick={() => onChoice(i)}
            disabled={disabled}
          >
            <span className="choice-text">{choice.text}</span>
            {choice.hint && <span className="choice-hint">{choice.hint}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
