import { useState, useEffect } from 'react';
import { usePlayer } from '../../music/context/PlayerContext';
import { useAuth } from '../../../context/AuthContext';
import { useSession } from '../../music/context/SessionContext';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import apiClient from '../../../api/apiClient';

const PlayerBar = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    showExpanded,
    setShowExpanded,
    audioRef,
    handlePlayPause,
    handleSkip,
    handleRepeat,
    handleVolumeChange,
    handleStop,
    handleShuffle,
    shuffleMode,
    activeSession,
    handleEndSession
  } = usePlayer();
  const { user } = useAuth();
  const { isAdmin } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Load favorite status when song changes
  useEffect(() => {
    if (currentSong?.id) {
      loadFavoriteStatus();
    } else {
      setIsFavorite(false);
    }
  }, [currentSong?.id]);

  const loadFavoriteStatus = async () => {
    try {
      const response = await apiClient.get('/songs/favorites');
      const favoriteIds = response.data.song_ids || [];
      setIsFavorite(favoriteIds.includes(currentSong.id));
    } catch (error) {
      console.error('Failed to load favorite status:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!currentSong || isToggling) return;
    
    setIsToggling(true);
    try {
      await apiClient.post(`/songs/${currentSong.id}/favorite`);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="bg-spotify-light-gray border-t border-spotify-black px-6 py-3 flex items-center justify-between fixed bottom-0 left-0 right-0 z-50 h-[90px]">
        {/* Song Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0 max-w-[30%]">
          {currentSong ? (
            <>
              {currentSong.thumbnail_url ? (
                <img
                  src={currentSong.thumbnail_url}
                  alt={currentSong.title}
                  className="w-14 h-14 rounded object-cover shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded bg-gradient-to-br from-spotify-green to-spotify-green-dark flex items-center justify-center shadow-md">
                  <span className="text-2xl">🎵</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-white truncate">{currentSong.title}</div>
                <div className="text-sm text-text-gray truncate">{currentSong.artist}</div>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded bg-spotify-gray flex items-center justify-center opacity-50">
                <svg className="w-6 h-6 text-text-gray" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-text-gray truncate opacity-50">Select a song to start playing</div>
                <div className="text-sm text-text-gray truncate opacity-30">Choose from your library</div>
              </div>
            </>
          )}
          {currentSong && (
            <button
              onClick={handleToggleFavorite}
              disabled={isToggling}
              className="text-text-gray hover:text-spotify-green transition-colors opacity-70 hover:opacity-100 disabled:opacity-50"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? (
                <MdFavorite className="w-5 h-5 text-spotify-green" />
              ) : (
                <MdFavoriteBorder className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-[40%]">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleShuffle}
              disabled={!currentSong}
              className={`p-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                shuffleMode ? 'text-spotify-green' : 'text-text-gray hover:text-white'
              }`}
              title="Shuffle"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15.854 4.854a.5.5 0 000-.708l-4-4a.5.5 0 00-.708.708L14.293 4H5.5A2.5 2.5 0 003 6.5v8A2.5 2.5 0 005.5 17h8a2.5 2.5 0 002.5-2.5V5.707l3.146 3.147a.5.5 0 00.708-.708l-4-4z" />
              </svg>
            </button>
            <button 
              onClick={() => handleSkip('previous')}
              disabled={!currentSong}
              className="text-text-gray hover:text-white p-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>
            <button
              onClick={handlePlayPause}
              disabled={!currentSong}
              className="w-10 h-10 bg-white text-spotify-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              )}
            </button>
            <button 
              onClick={() => handleSkip('next')}
              disabled={!currentSong}
              className="text-text-gray hover:text-white p-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0011 6v2.798l-5.445-2.63z" />
              </svg>
            </button>
            <button 
              onClick={handleRepeat}
              disabled={!currentSong}
              className="text-text-gray hover:text-white p-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Repeat"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-xs text-white w-12 font-medium">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = e.target.value;
                }
              }}
              disabled={!currentSong}
              className="flex-1 h-1 bg-spotify-gray rounded-lg appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed slider-thumb"
              style={{
                background: currentSong 
                  ? `linear-gradient(to right, #1DB954 0%, #1DB954 ${(currentTime / (duration || 1)) * 100}%, #333 ${(currentTime / (duration || 1)) * 100}%, #333 100%)`
                  : '#333'
              }}
            />
            <span className="text-xs text-white w-12 font-medium">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Right Controls */}
        <div className="flex items-center gap-4 flex-1 justify-end max-w-[30%]">
          <button 
            onClick={handleStop}
            disabled={!currentSong}
            className="text-text-gray hover:text-white p-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Stop"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            disabled={!currentSong}
            className="text-text-gray hover:text-white p-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Volume"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value);
              if (handleVolumeChange) {
                handleVolumeChange(newVolume);
              }
            }}
            disabled={!currentSong}
            className="w-24 h-1 bg-spotify-gray rounded-lg appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed slider-thumb"
            style={{
              background: currentSong
                ? `linear-gradient(to right, #1DB954 0%, #1DB954 ${volume * 100}%, #333 ${volume * 100}%, #333 100%)`
                : '#333'
            }}
          />
          {/* Find Stress Button - Only visible when active session exists and user is not admin */}
          {activeSession && !isAdmin && (
            <button
              onClick={handleEndSession}
              className="px-4 py-2 bg-spotify-green hover:bg-spotify-green-hover text-white rounded-full text-sm font-semibold transition-colors"
              title="Find Your Stress Level"
            >
              Find Stress
            </button>
          )}
          <button
            onClick={() => currentSong && setShowExpanded(true)}
            disabled={!currentSong}
            className="text-text-gray hover:text-white p-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Expand Player"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default PlayerBar;

