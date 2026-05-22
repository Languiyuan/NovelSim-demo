import React, { useState, useEffect, useCallback } from 'react';
import { NarrativeEntry } from '../types/game.types';
import './NarrativeFlow.css';

interface Props {
  entries: NarrativeEntry[];
  isTyping: boolean;
  onTypingComplete: () => void;
}

export function NarrativeFlow({ entries, isTyping, onTypingComplete }: Props) {
  const [displayedCount, setDisplayedCount] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);

  const latestEntry = entries[entries.length - 1];

  // 打字机效果
  useEffect(() => {
    if (!isTyping || !latestEntry || displayedCount >= entries.length) {
      return;
    }

    const text = latestEntry.text;
    if (typingIndex >= text.length) {
      setDisplayedCount(entries.length);
      setTypingText('');
      setTypingIndex(0);
      onTypingComplete();
      return;
    }

    const timer = setTimeout(() => {
      setTypingText(text.substring(0, typingIndex + 1));
      setTypingIndex(typingIndex + 1);
    }, 35);

    return () => clearTimeout(timer);
  }, [isTyping, typingIndex, latestEntry, entries.length, displayedCount, onTypingComplete]);

  // 新条目到来时开始打字
  useEffect(() => {
    if (entries.length > displayedCount && isTyping) {
      setTypingText('');
      setTypingIndex(0);
    }
  }, [entries.length]);

  // 点击跳过打字
  const skipTyping = useCallback(() => {
    if (isTyping && latestEntry) {
      setTypingText(latestEntry.text);
      setTypingIndex(latestEntry.text.length);
      setDisplayedCount(entries.length);
      onTypingComplete();
    }
  }, [isTyping, latestEntry, entries.length, onTypingComplete]);

  return (
    <div className="narrative-flow" onClick={skipTyping}>
      {entries.slice(0, displayedCount).map((entry, i) => (
        <div key={i} className={`narrative-entry narrative-${entry.type} fade-in`}>
          {entry.type === 'choice' ? (
            <div className="choice-record">{entry.text}</div>
          ) : (
            <p>{entry.text}</p>
          )}
        </div>
      ))}

      {/* 正在打字的条目 */}
      {isTyping && displayedCount < entries.length && latestEntry && (
        <div className={`narrative-entry narrative-${latestEntry.type}`}>
          <p>
            {typingText}
            <span className="typing-cursor">|</span>
          </p>
        </div>
      )}
    </div>
  );
}
