import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useSession } from '../../../admin/music/context/SessionContext';
import { handleSessionEnd } from '../../../../utils/musicSessionEndHandler';
import { showWarningToast } from '../../../../utils/notifications';
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
