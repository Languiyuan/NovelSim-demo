import React from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export function TypewriterText({ text, speed = 50, onComplete }: TypewriterTextProps) {
  const { displayedText, isComplete, skipToEnd } = useTypewriter(text, speed);

  React.useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  return (
    <div className="typewriter-text" onClick={skipToEnd}>
      {displayedText}
      {!isComplete && <span className="cursor">|</span>}
    </div>
  );
}
