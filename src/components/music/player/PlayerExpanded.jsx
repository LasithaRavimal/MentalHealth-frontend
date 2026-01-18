import { useState, useRef, useEffect } from 'react';

const PlayerExpanded = ({ song, isPlaying, onPlayPause, onClose, currentTime, duration, volume, onVolumeChange, onSeek }) => {
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!song) return null;

  return (
    <div className="fixed inset-0 bg-bg-primary z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
        <h2 className="text-lg font-semibold text-text-primary">Now Playing</h2>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          {/* Album Art */}
          <div className="mb-8">
            {song.thumbnail_url ? (
              <img
                src={song.thumbnail_url}
                alt={song.title}
                className="w-full max-w-md mx-auto aspect-square object-cover rounded-lg shadow-elevated"
              />
            ) : (
              <div className="w-full max-w-md mx-auto aspect-square bg-gradient-to-br from-primary-green to-primary-green-dark rounded-lg flex items-center justify-center shadow-elevated">
                <span className="text-9xl">🎵</span>
              </div>
            )}
          </div>

          {/* Song Info */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">{song.title}</h1>
            <p className="text-xl text-text-secondary">{song.artist}</p>
            {song.category && (
              <span className="inline-block mt-3 px-3 py-1 bg-bg-tertiary text-text-secondary rounded-full text-sm">
                {song.category}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-text-secondary mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <button className="text-text-secondary hover:text-text-primary p-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.3 3.3a1 1 0 000 1.4l7 7a1 1 0 001.4-1.4l-7-7a1 1 0 00-1.4 0z" />
                <path d="M5.3 16.7a1 1 0 010-1.4l7-7a1 1 0 011.4 1.4l-7 7a1 1 0 01-1.4 0z" />
              </svg>
            </button>
            <button className="text-text-secondary hover:text-text-primary p-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>
            <button
              onClick={onPlayPause}
              className="w-16 h-16 bg-text-primary text-bg-primary rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-elevated"
            >
              {isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              )}
            </button>
            <button className="text-text-secondary hover:text-text-primary p-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0011 6v2.798l-5.445-2.63z" />
              </svg>
            </button>
            <button className="text-text-secondary hover:text-text-primary p-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center justify-center gap-4">
            <svg className="w-5 h-5 text-text-secondary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.928 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.928l3.455-3.793a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-64"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerExpanded;

