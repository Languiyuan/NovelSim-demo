import React from 'react';
import { useGameStore } from './store/useGameStore';
import { StartScreen } from './components/StartScreen';
import { CreateScreen } from './components/CreateScreen';
import { GameScreen } from './components/GameScreen';
import { EndingScreen } from './components/EndingScreen';

function App() {
  const phase = useGameStore((s) => s.phase);

  switch (phase) {
    case 'idle':
      return <StartScreen />;
    case 'creating':
      return <CreateScreen />;
    case 'playing':
      return <GameScreen />;
    case 'ended':
      return <EndingScreen />;
    default:
      return <StartScreen />;
  }
}

export default App;
