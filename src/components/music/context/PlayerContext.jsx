import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useSession } from '../../../components/music/context/SessionContext';
import { handleSessionEnd } from '../../../utils/musicSessionEndHandler';
import { showWarningToast } from '../../../utils/notifications';
import apiClient from '../../../../api/apiClient';

const PlayerContext = createContext(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(null);
  const { isAdmin, user } = useAuth();
  const session = useSession();
  const { startSession, trackSongPlay, trackSongPause, trackSkip, trackRepeat, trackVolumeChange, updateActivity, isAdmin: sessionIsAdmin } = session;

  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showExpanded, setShowExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [prediction, setPrediction] = useState(null);
  
  // Song queue system
  const [songQueue, setSongQueue] = useState([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(-1);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [originalQueue, setOriginalQueue] = useState([]); // Store original order for shuffle toggle
  
  const playStartTimeRef = useRef(null);
  const previousSongIdRef = useRef(null);

  // Build song queue when first song is played (must be defined before useEffect)
  const buildQueue = useCallback(async (initialSong) => {
    try {
      const response = await apiClient.get('/songs');
      const allSongs = response.data || [];
      
      // Find index of initial song
      const initialIndex = allSongs.findIndex(s => s.id === initialSong.id);
      
      // Set queue
      setSongQueue(allSongs);
      setOriginalQueue(allSongs);
      setCurrentQueueIndex(initialIndex >= 0 ? initialIndex : 0);
    } catch (error) {
      console.error('Failed to load songs for queue:', error);
      // Fallback: use single song as queue
      setSongQueue([initialSong]);
      setOriginalQueue([initialSong]);
      setCurrentQueueIndex(0);
    }
  }, []);

  // Define onPlaySong before useEffect that uses it
  const onPlaySong = useCallback(async (song) => {
    // Don't end session when switching songs - session should persist
    // Session only ends when user clicks "Find Stress" or after 10-minute inactivity
    
    // Check if this is a different song than currently playing
    const isDifferentSong = currentSong && currentSong.id !== song.id;
    
    // If different song, reset to beginning and clear saved position
    if (isDifferentSong) {
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      // Clear saved position for the new song (will be set fresh when it plays)
      localStorage.removeItem(`currentTime_${song.id}`);
    }
    
    // Check queue and build if needed
    setSongQueue(prevQueue => {
      if (prevQueue.length === 0 || !prevQueue.find(s => s.id === song.id)) {
        // Queue will be built asynchronously
        buildQueue(song).catch(console.error);
        return prevQueue;
      } else {
        // Update current index if song is in queue
        const index = prevQueue.findIndex(s => s.id === song.id);
        if (index >= 0) {
          setCurrentQueueIndex(index);
        }
        return prevQueue;
      }
    });
    
    setCurrentSong(song);
    
    // Wait for audio to load before starting playback
    if (audioRef.current) {
      await new Promise((resolve) => {
        const handleCanPlay = () => {
          audioRef.current.removeEventListener('canplay', handleCanPlay);
          resolve();
        };
        audioRef.current.addEventListener('canplay', handleCanPlay);
        audioRef.current.load();
      });
    }

    // Start session if not active (only when first song is played, not when switching)
    let activeSessionId = session.activeSession;
    if (!activeSessionId && !sessionIsAdmin) {
      activeSessionId = await startSession(song.id);
    }

    // Track song play (only if we have an active session and not admin)
    if (activeSessionId && !sessionIsAdmin) {
      playStartTimeRef.current = 0; // Always start from beginning for new song
      trackSongPlay(song.id, song.category || 'calm', playStartTimeRef.current);
    }
    
    // Resume from current position if already loaded
    if (audioRef.current && isPlaying) {
      await audioRef.current.play();
    } else {
      setIsPlaying(true);
    }
  }, [session, sessionIsAdmin, startSession, trackSongPlay, isPlaying, buildQueue, currentSong]);

  // Load player state from localStorage on mount
  useEffect(() => {
    const savedSong = localStorage.getItem('currentSong');
    const savedIsPlaying = localStorage.getItem('isPlaying');
    const savedVolume = localStorage.getItem('volume');
    
    // Load playback preferences from localStorage
    const savedPrefs = localStorage.getItem('userPreferences');
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        // Apply default shuffle mode
        if (prefs.defaultShuffle !== undefined) {
          setShuffleMode(prefs.defaultShuffle);
        }
        // Apply default volume (prefer userPreferences over direct volume key)
        if (prefs.defaultVolume !== undefined) {
          const vol = parseFloat(prefs.defaultVolume);
          if (!isNaN(vol) && vol >= 0 && vol <= 1) {
            setVolume(vol);
          }
        }
      } catch (e) {
        console.error('Failed to load user preferences:', e);
      }
    }

    if (savedSong) {
      try {
        const song = JSON.parse(savedSong);
        setCurrentSong(song);
        // Restore per-song position if available
        if (song && song.id) {
          const savedCurrentTime = localStorage.getItem(`currentTime_${song.id}`);
          if (savedCurrentTime) {
            const time = parseFloat(savedCurrentTime);
            if (!isNaN(time) && time >= 0) {
              setCurrentTime(time);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load saved song:', e);
      }
    }
    if (savedIsPlaying === 'true') {
      setIsPlaying(true);
    }
    // Only apply savedVolume if userPreferences didn't override it
    if (savedVolume && !savedPrefs) {
      const vol = parseFloat(savedVolume);
      if (!isNaN(vol) && vol >= 0 && vol <= 1) {
        setVolume(vol);
      }
    }
  }, []);

  // Save player state to localStorage
  useEffect(() => {
    if (currentSong) {
      localStorage.setItem('currentSong', JSON.stringify(currentSong));
    } else {
      localStorage.removeItem('currentSong');
    }
  }, [currentSong]);

  useEffect(() => {
    localStorage.setItem('isPlaying', isPlaying.toString());
  }, [isPlaying]);

  useEffect(() => {
    localStorage.setItem('volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    // Save currentTime per song ID
    if (currentSong && currentSong.id && currentTime > 0) {
      localStorage.setItem(`currentTime_${currentSong.id}`, currentTime.toString());
    }
  }, [currentTime, currentSong]);

  // Set audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Load and play audio when song changes
  useEffect(() => {
    if (currentSong && audioRef.current) {
      const isDifferentSong = previousSongIdRef.current !== null && previousSongIdRef.current !== currentSong.id;
      
      audioRef.current.src = currentSong.audio_url || '';
      audioRef.current.load();
      
      // Only restore saved position if it's the SAME song (not a different one)
      if (!isDifferentSong) {
        // Same song - check if there's a saved position
        const savedTime = localStorage.getItem(`currentTime_${currentSong.id}`);
        if (savedTime && parseFloat(savedTime) > 0) {
          // Restore saved position (user paused this song before)
          audioRef.current.currentTime = parseFloat(savedTime);
          setCurrentTime(parseFloat(savedTime));
        } else {
          // No saved position - start from beginning
          setCurrentTime(0);
          audioRef.current.currentTime = 0;
        }
      } else {
        // Different song - always start from beginning
        setCurrentTime(0);
        audioRef.current.currentTime = 0;
        // Clear any saved position for this song to ensure fresh start
        localStorage.removeItem(`currentTime_${currentSong.id}`);
      }
      
      // Update previous song ID after processing
      previousSongIdRef.current = currentSong.id;

      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      }
    } else if (!currentSong && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      previousSongIdRef.current = null;
    }
  }, [currentSong, isPlaying]);

  // Track audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Update localStorage periodically per song ID
      if (currentSong && currentSong.id && Math.floor(audio.currentTime) % 5 === 0) {
        localStorage.setItem(`currentTime_${currentSong.id}`, audio.currentTime.toString());
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = async () => {
      setIsPlaying(false);
      if (currentSong && playStartTimeRef.current) {
        const duration = audio.duration || 0;
        trackSongPause(currentSong.id, duration);
        playStartTimeRef.current = null;
      }
      updateActivity();
      // Remove song-specific saved time
      if (currentSong && currentSong.id) {
        localStorage.removeItem(`currentTime_${currentSong.id}`);
      }
      
      // Auto-play next song if available
      if (songQueue.length > 0 && currentQueueIndex >= 0) {
        let nextIndex;
        if (shuffleMode) {
          // Pick random song from queue
          nextIndex = Math.floor(Math.random() * songQueue.length);
        } else {
          // Play next song in queue
          nextIndex = currentQueueIndex + 1;
          if (nextIndex >= songQueue.length) {
            nextIndex = 0; // Loop back to start
          }
        }
        
        if (songQueue[nextIndex]) {
          // Small delay before playing next song
          setTimeout(async () => {
            await onPlaySong(songQueue[nextIndex]);
            setCurrentQueueIndex(nextIndex);
          }, 500);
        }
      }
    };

    const handlePlay = () => {
      updateActivity();
      setIsPlaying(true);
    };

    const handlePause = () => {
      updateActivity();
      setIsPlaying(false);
      if (currentSong && playStartTimeRef.current !== null) {
        const duration = audio.currentTime - playStartTimeRef.current;
        trackSongPause(currentSong.id, duration);
        // Don't reset playStartTimeRef - keep it for resume
      }
      // Save current position per song ID
      if (currentSong && currentSong.id) {
        localStorage.setItem(`currentTime_${currentSong.id}`, audio.currentTime.toString());
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [currentSong, trackSongPause, updateActivity, songQueue, currentQueueIndex, shuffleMode, onPlaySong]);

  const handlePlayPause = useCallback(async () => {
    if (!currentSong) return;

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      // Resume from current position if we have a saved position
      if (audioRef.current) {
        // Only update playStartTimeRef if it's null (fresh start) or if we're at the beginning
        if (playStartTimeRef.current === null || audioRef.current.currentTime === 0) {
          playStartTimeRef.current = audioRef.current.currentTime || 0;
        }
        
        // Ensure session is started (only for non-admin users)
        if (!session.activeSession && !sessionIsAdmin) {
          await startSession(currentSong.id);
        }
        
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
        
        // Track song play only if we have an active session and not admin
        if (session.activeSession && !sessionIsAdmin && playStartTimeRef.current !== null) {
          trackSongPlay(currentSong.id, currentSong.category || 'calm', playStartTimeRef.current);
        }
      }
      setIsPlaying(true);
    }
    updateActivity();
  }, [currentSong, isPlaying, session, sessionIsAdmin, startSession, trackSongPlay, updateActivity]);

  const handleSkip = useCallback(async (direction = 'next') => {
    if (!currentSong || songQueue.length === 0) return;
    
    // Track skip for current song
    trackSkip(currentSong.id);
    
    // Calculate next/previous index
    let nextIndex;
    if (shuffleMode) {
      // Pick random song from queue
      nextIndex = Math.floor(Math.random() * songQueue.length);
      // Avoid playing same song if queue has more than 1 song
      while (nextIndex === currentQueueIndex && songQueue.length > 1) {
        nextIndex = Math.floor(Math.random() * songQueue.length);
      }
    } else {
      if (direction === 'next') {
        nextIndex = currentQueueIndex + 1;
        if (nextIndex >= songQueue.length) {
          nextIndex = 0; // Loop back to start
        }
      } else {
        // Previous
        nextIndex = currentQueueIndex - 1;
        if (nextIndex < 0) {
          nextIndex = songQueue.length - 1; // Loop to end
        }
      }
    }
    
    if (songQueue[nextIndex]) {
      await onPlaySong(songQueue[nextIndex]);
      setCurrentQueueIndex(nextIndex);
    }
    
    updateActivity();
  }, [currentSong, songQueue, currentQueueIndex, shuffleMode, trackSkip, onPlaySong, updateActivity]);
  
  const handleShuffle = useCallback(() => {
    setShuffleMode(!shuffleMode);
    // If enabling shuffle, shuffle the queue
    if (!shuffleMode && songQueue.length > 0) {
      const shuffled = [...songQueue];
      // Fisher-Yates shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      // Keep current song at its position
      const currentSongIndex = shuffled.findIndex(s => s.id === currentSong?.id);
      if (currentSongIndex > 0) {
        [shuffled[0], shuffled[currentSongIndex]] = [shuffled[currentSongIndex], shuffled[0]];
      }
      setSongQueue(shuffled);
    } else if (shuffleMode && originalQueue.length > 0) {
      // Restore original order
      setSongQueue(originalQueue);
      const currentIndex = originalQueue.findIndex(s => s.id === currentSong?.id);
      if (currentIndex >= 0) {
        setCurrentQueueIndex(currentIndex);
      }
    }
  }, [shuffleMode, songQueue, originalQueue, currentSong]);

  const handleRepeat = useCallback(async () => {
    if (!currentSong || !audioRef.current) return;
    
    // Ensure session is started
    if (!session.activeSession && !sessionIsAdmin) {
      await startSession(currentSong.id);
    }
    
    trackRepeat(currentSong.id);
    audioRef.current.currentTime = 0;
    playStartTimeRef.current = 0;
    if (!isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
    updateActivity();
  }, [currentSong, session, sessionIsAdmin, startSession, trackRepeat, isPlaying, updateActivity]);

  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    trackVolumeChange(newVolume);
    updateActivity();
  }, [trackVolumeChange, updateActivity]);
  
  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    playStartTimeRef.current = null;
    // Remove song-specific saved time
    if (currentSong && currentSong.id) {
      localStorage.removeItem(`currentTime_${currentSong.id}`);
    }
  }, [currentSong]);

  const handleEndSession = useCallback(async () => {
    // Calculate total listening time from songDurations Map
    const totalListeningSeconds = Array.from(session.songDurations.values())
      .reduce((sum, duration) => sum + duration, 0);
    
    const MINIMUM_LISTENING_TIME_SECONDS = 300; // 5 minutes
    
    // Validate minimum listening time
    if (totalListeningSeconds < MINIMUM_LISTENING_TIME_SECONDS) {
      const remainingMinutes = Math.ceil((MINIMUM_LISTENING_TIME_SECONDS - totalListeningSeconds) / 60);
      showWarningToast(
        `Keep listening at least 5min for better accuracy. You need ${remainingMinutes} more minute(s).`,
        6000
      );
      return; // Don't proceed with session end
    }
    
    // Proceed with normal flow if validation passes
    const predictionResult = await handleSessionEnd(session, (pred) => {
      setPrediction(pred);
      setShowPredictionModal(true);
    });
  }, [session]);

  const value = {
    currentSong,
    setCurrentSong,
    isPlaying,
    setIsPlaying,
    showExpanded,
    setShowExpanded,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    setVolume,
    onPlaySong,
    activeSession: session.activeSession,
    audioRef,
    handlePlayPause,
    handleSkip,
    handleRepeat,
    handleVolumeChange,
    handleStop,
    handleShuffle,
    shuffleMode,
    handleEndSession,
    showPredictionModal,
    setShowPredictionModal,
    prediction,
    setPrediction,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} />
    </PlayerContext.Provider>
  );
};

