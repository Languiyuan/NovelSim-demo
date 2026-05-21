import React, { useRef, useEffect } from 'react';
import { TypewriterText } from './TypewriterText';

interface NarrativeAreaProps {
  narrativeHistory: { text: string; type: string }[];
  isTyping: boolean;
  onTypingComplete: () => void;
}

export function NarrativeArea({
  narrativeHistory,
  isTyping,
  onTypingComplete,
}: NarrativeAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [narrativeHistory, isTyping]);

  return (
    <div className="narrative-area" ref={scrollRef}>
      {narrativeHistory.map((item, index) => {
        const isLast = index === narrativeHistory.length - 1;
        return (
          <div key={index} className={`narrative-paragraph ${item.type}`}>
            {isLast && isTyping ? (
              <TypewriterText
                text={item.text}
                speed={40}
                onComplete={onTypingComplete}
              />
            ) : (
              <p>{item.text}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
