import React, { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { StatusBar } from './components/StatusBar';
import { NarrativeArea } from './components/NarrativeArea';
import { ActionPanel } from './components/ActionPanel';
import { EndingScreen } from './components/EndingScreen';
import { CharacterPanel } from './components/CharacterPanel';

function App() {
  const { state, startGame, continueStory, makeChoice, onTypingComplete, resetGame } =
    useGameState();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  if (state.phase === 'idle') {
    return (
      <div className="app">
        <div className="start-screen">
          <h1 className="game-title">文字修仙</h1>
          <p className="game-subtitle">AI 驱动的修仙叙事体验</p>
          <button
            className="start-button"
            onClick={startGame}
            disabled={state.isLoading}
          >
            {state.isLoading ? '初始化中...' : '开始修行'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${isPanelOpen ? 'panel-open' : ''}`}>
      <StatusBar
        character={state.character}
        storyPhase={state.storyPhase}
        stats={state.characterStats}
        onTogglePanel={() => setIsPanelOpen((v) => !v)}
        isPanelOpen={isPanelOpen}
      />

      <div className="game-content">
        <NarrativeArea
          narrativeHistory={state.narrativeHistory}
          isTyping={state.isTyping}
          onTypingComplete={onTypingComplete}
        />

        {state.phase === 'ended' && state.ending ? (
          <EndingScreen ending={state.ending} onRestart={resetGame} />
        ) : (
          <ActionPanel
            isLoading={state.isLoading}
            isTyping={state.isTyping}
            currentNode={state.currentNode}
            gamePhase={state.phase}
            onContinue={continueStory}
            onChoice={makeChoice}
          />
        )}
      </div>

      <CharacterPanel
        stats={state.characterStats}
        lastChanges={state.lastAttributeChanges}
        character={state.character}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}

export default App;
