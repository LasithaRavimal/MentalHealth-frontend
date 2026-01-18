import React from 'react';

const AudioVisualizer = ({ isRecording }) => {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-spotify-green rounded-full transition-all duration-300 ${
            isRecording ? 'animate-pulse' : 'h-2'
          }`}
          style={{
            height: isRecording ? `${Math.random() * 100}%` : '8px',
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;