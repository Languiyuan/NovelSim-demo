import React from 'react';
import { NodeChoice } from '../types/game.types';

interface ChoiceButtonProps {
  choice: NodeChoice;
  index: number;
  onClick: () => void;
  disabled: boolean;
}

export function ChoiceButton({ choice, index, onClick, disabled }: ChoiceButtonProps) {
  return (
    <button className="choice-button" onClick={onClick} disabled={disabled}>
      <span className="choice-index">{index + 1}</span>
      <div className="choice-content">
        <span className="choice-text">{choice.text}</span>
        {choice.hint && <span className="choice-hint">{choice.hint}</span>}
      </div>
    </button>
  );
}
