import React from 'react';
import { GameNode } from '../types/game.types';
import { ChoiceButton } from './ChoiceButton';

interface ActionPanelProps {
  isLoading: boolean;
  isTyping: boolean;
  currentNode: GameNode | null;
  gamePhase: string;
  onContinue: () => void;
  onChoice: (nodeId: number, choiceIndex: number) => void;
}

export function ActionPanel({
  isLoading,
  isTyping,
  currentNode,
  gamePhase,
  onContinue,
  onChoice,
}: ActionPanelProps) {
  if (isLoading) {
    return (
      <div className="action-panel">
        <div className="loading-indicator">
          <span className="loading-dots">仙法推演中</span>
        </div>
      </div>
    );
  }

  if (isTyping) {
    return (
      <div className="action-panel">
        <p className="hint-text">点击文字可跳过动画</p>
      </div>
    );
  }

  if (gamePhase === 'ended') {
    return null;
  }

  if (currentNode && currentNode.choices) {
    return (
      <div className="action-panel">
        {currentNode.text && (
          <p className="node-text">{currentNode.text}</p>
        )}
        <div className="choices-container">
          {currentNode.choices.map((choice, index) => (
            <ChoiceButton
              key={index}
              choice={choice}
              index={index}
              onClick={() => onChoice(currentNode.id, index)}
              disabled={false}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="action-panel">
      <button className="continue-button" onClick={onContinue}>
        继续
      </button>
    </div>
  );
}
