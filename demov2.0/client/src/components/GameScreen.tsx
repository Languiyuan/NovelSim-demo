import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { AttributePanel } from './AttributePanel';
import { NarrativeFlow } from './NarrativeFlow';
import { NodePanel } from './NodePanel';
import './GameScreen.css';

export function GameScreen() {
  const {
    character, narrativeHistory, currentNode, isLoading, isTyping,
    canBreakthrough, getNextNode, makeChoice, tryBreakthrough, setTypingComplete,
  } = useGameStore();

  const narrativeEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    narrativeEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [narrativeHistory.length]);

  return (
    <div className="game-screen">
      {/* 顶部属性面板 */}
      <AttributePanel character={character} />

      {/* 中部叙事流 */}
      <div className="game-main">
        <NarrativeFlow
          entries={narrativeHistory}
          isTyping={isTyping}
          onTypingComplete={setTypingComplete}
        />
        <div ref={narrativeEndRef} />
      </div>

      {/* 底部交互区 */}
      <div className="game-actions">
        {currentNode ? (
          <NodePanel
            node={currentNode}
            onChoice={(choiceIndex) => makeChoice(currentNode.id, choiceIndex)}
            disabled={isLoading}
          />
        ) : (
          <div className="action-buttons">
            {canBreakthrough && (
              <button
                className="btn btn-success"
                onClick={tryBreakthrough}
                disabled={isLoading}
              >
                尝试突破
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={getNextNode}
              disabled={isLoading || isTyping}
            >
              {isLoading ? '修炼中...' : '继续修炼'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
