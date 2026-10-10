import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speakWord, isSpeechAvailable } from '../utils/speech';

export const SpeakerButton = ({
  word,
  language,
  size = 20,
  className = '',
  style = {},
  showLabel = false,
  buttonId = undefined,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isSpeechAvailable() || !word) {
    return null;
  }

  const handleSpeak = (e) => {
    e.stopPropagation();
    setIsPlaying(true);
    speakWord(word, language, () => {
      setIsPlaying(false);
    });
  };

  return (
    <button
      type="button"
      id={buttonId}
      className={`btn-speaker ${isPlaying ? 'playing' : ''} ${className}`}
      onClick={handleSpeak}
      title={`Listen to native pronunciation of "${word}" in ${language} (Key: P)`}
      aria-label={`Pronounce ${word}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: showLabel ? '0.4rem 0.8rem' : '0.45rem',
        borderRadius: 999,
        border: '1px solid rgba(255, 255, 255, 0.12)',
        background: isPlaying ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.05)',
        color: isPlaying ? '#a5b4fc' : 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
    >
      <Volume2 size={size} className={isPlaying ? 'animate-pulse' : ''} />
      {showLabel && (
        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          {isPlaying ? 'Speaking...' : 'Listen'}
        </span>
      )}
    </button>
  );
};

export default SpeakerButton;
