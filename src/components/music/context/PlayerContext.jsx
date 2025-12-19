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
