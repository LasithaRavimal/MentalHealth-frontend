import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../../../../api/apiClient';
import { useAuth } from '../../../context/AuthContext';

const SessionContext = createContext(null);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [activeSession, setActiveSession] = useState(null);
  const [sessionEvents, setSessionEvents] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [lastActivityTime, setLastActivityTime] = useState(null);
  
  // Song tracking
  const [songsPlayed, setSongsPlayed] = useState([]); // Array of {songId, category, duration, timestamp}
  const [songDurations, setSongDurations] = useState(new Map()); // songId -> total duration listened
  const [skipCount, setSkipCount] = useState(0);
  const [repeatCount, setRepeatCount] = useState(0);
  const [volumeHistory, setVolumeHistory] = useState([]); // Array of {volume, timestamp}
  
  // Inactivity timer
  const inactivityTimerRef = useRef(null);
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
  
  // Update last activity time
  const updateActivity = useCallback(() => {
    const now = new Date();
    setLastActivityTime(now);
    
    // Clear existing inactivity timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Set new inactivity timer
    inactivityTimerRef.current = setTimeout(() => {
      if (activeSession) {
        endSession();
      }
    }, INACTIVITY_TIMEOUT);
  }, [activeSession]);
  
  // Start a new session
  const startSession = useCallback(async (songId = null) => {
    // Disable session tracking for admin users
    if (isAdmin) {
      console.log('Session tracking disabled for admin users');
      return null;
    }
    
    try {
      // Check if there's already an active session
      const existingSessionResponse = await apiClient.get('/sessions/active').catch(() => null);
      
      if (existingSessionResponse?.data?.session_id) {
        // Use existing active session
        setActiveSession(existingSessionResponse.data.session_id);
        setSessionStartTime(new Date(existingSessionResponse.data.started_at));
        updateActivity();
        return existingSessionResponse.data.session_id;
      }
      
      // Start new session
      const response = await apiClient.post('/sessions/start', {
        song_id: songId || null
      });
      
      const sessionId = response.data.session_id;
      setActiveSession(sessionId);
      setSessionStartTime(new Date(response.data.started_at));
      setSessionEvents([]);
      setSongsPlayed([]);
      setSongDurations(new Map());
      setSkipCount(0);
      setRepeatCount(0);
      setVolumeHistory([]);
      updateActivity();
      
      return sessionId;
    } catch (error) {
      console.error('Failed to start session:', error);
      return null;
    }
  }, [updateActivity, isAdmin]);
  
  // Track an event
  const trackEvent = useCallback((event) => {
    if (isAdmin || !activeSession) return;
    
    const eventWithTimestamp = {
      ...event,
      timestamp: new Date(),
    };
    
    setSessionEvents(prev => [...prev, eventWithTimestamp]);
    updateActivity();
    
    // Send heartbeat to backend
    apiClient.post('/sessions/heartbeat', null, {
      params: { session_id: activeSession }
    }).catch(err => {
      // Silently fail - session might have been auto-ended
      console.debug('Heartbeat failed (may be expected):', err);
    });
  }, [activeSession, updateActivity]);
  
  // Track song play
  const trackSongPlay = useCallback((songId, category, startTime) => {
    if (isAdmin || !activeSession) return;
    
    trackEvent({
      type: 'play',
      song_id: songId,
      metadata: { category, startTime }
    });
    
    setSongsPlayed(prev => [...prev, {
      songId,
      category,
      startTime: new Date(),
      duration: 0 // Will be updated on pause/end
    }]);
  }, [activeSession, trackEvent]);
  
  // Track song pause/finish
  const trackSongPause = useCallback((songId, duration) => {
    if (isAdmin || !activeSession) return;
    
    trackEvent({
      type: 'pause',
      song_id: songId,
      duration
    });
    
    // Update song duration
    setSongDurations(prev => {
      const newMap = new Map(prev);
      const currentDuration = newMap.get(songId) || 0;
      newMap.set(songId, currentDuration + duration);
      return newMap;
    });
    
    // Update songsPlayed array with duration
    setSongsPlayed(prev => prev.map(song => {
      if (song.songId === songId && song.duration === 0) {
        return { ...song, duration: duration };
      }
      return song;
    }));
  }, [activeSession, trackEvent]);
  
  // Track skip
  const trackSkip = useCallback((songId) => {
    if (isAdmin || !activeSession) return;
    
    setSkipCount(prev => prev + 1);
    trackEvent({
      type: 'skip',
      song_id: songId
    });
  }, [activeSession, trackEvent]);
  
  // Track repeat
  const trackRepeat = useCallback((songId) => {
    if (isAdmin || !activeSession) return;
    
    setRepeatCount(prev => prev + 1);
    trackEvent({
      type: 'repeat',
      song_id: songId
    });
  }, [activeSession, trackEvent]);
  
  // Track volume change
  const trackVolumeChange = useCallback((volume) => {
    if (isAdmin || !activeSession) return;
    
    setVolumeHistory(prev => [...prev, {
      volume,
      timestamp: new Date()
    }]);
    
    trackEvent({
      type: 'volume_change',
      volume
    });
  }, [activeSession, trackEvent]);
  
  // End session - this will be called by sessionEndHandler with aggregation
  const endSession = useCallback(async (aggregatedData = null) => {
    if (isAdmin || !activeSession) return null;
    
    try {
      // Clear inactivity timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      
      // If aggregated data not provided, create minimal aggregation
      // (Usually sessionEndHandler will provide this)
      if (!aggregatedData) {
        // Use minimal defaults - sessionEndHandler should handle full aggregation
        aggregatedData = {
          song_category_mode: 'calm',
          skip_rate_bucket: 'Never',
          repeat_bucket: 'None',
          duration_ratio_bucket: 'Around 50%',
          session_length_bucket: 'Less than 10 min',
          volume_level_bucket: 'Medium',
          song_diversity_bucket: 'One category',
          listening_time_of_day: _getListeningTimeOfDay()
        };
      }
      
      const response = await apiClient.post('/sessions/end', {
        session_id: activeSession,
        events: sessionEvents,
        aggregated_data: aggregatedData
      });
      
      // Clear session state
      setActiveSession(null);
      setSessionEvents([]);
      setSessionStartTime(null);
      setLastActivityTime(null);
      setSongsPlayed([]);
      setSongDurations(new Map());
      setSkipCount(0);
      setRepeatCount(0);
      setVolumeHistory([]);
      
      return response.data;
    } catch (error) {
      console.error('Failed to end session:', error);
      // Still clear state even if API call fails
      setActiveSession(null);
      setSessionEvents([]);
      return null;
    }
  }, [activeSession, sessionEvents, isAdmin]);
  
          // End session on logout
          useEffect(() => {
            if (!user && activeSession) {
              // User logged out, end session before clearing state
              endSession().catch(err => console.error('Failed to end session on logout:', err));
            }
          }, [user, activeSession, endSession]);
  
  // Tab close handler - send beacon if session active
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeSession) {
        // Try to end session using sendBeacon
        // Note: sendBeacon only sends simple data, so we'll just notify backend
        // The backend cron will handle cleanup if this fails
        const data = JSON.stringify({
          session_id: activeSession,
          action: 'tab_close'
        });
        
        // Try to end session with aggregated data using sendBeacon or fetch
        // Note: This may not complete, so backend cron will handle cleanup
        const token = localStorage.getItem('token');
        const aggregatedData = {
          song_category_mode: _getMostFrequentCategory(),
          skip_rate_bucket: skipCount === 0 ? 'Never' : skipCount <= 2 ? '1-2 times' : skipCount <= 5 ? '3-5 times' : 'More than 5 times',
          repeat_bucket: repeatCount === 0 ? 'None' : repeatCount <= 2 ? '1-2 times' : repeatCount <= 5 ? '3-5 times' : 'More than 5',
          duration_ratio_bucket: 'Around 50%',
          session_length_bucket: sessionStartTime ? _calculateSessionLengthBucket(sessionStartTime, new Date()) : 'Less than 10 min',
          volume_level_bucket: _getAverageVolumeBucket(),
          song_diversity_bucket: _getSongDiversityBucket(),
          listening_time_of_day: _getListeningTimeOfDay()
        };
        
        const payload = JSON.stringify({
          session_id: activeSession,
          events: sessionEvents.slice(-10), // Last 10 events only
          aggregated_data: aggregatedData
        });
        
        // Try sendBeacon first (more reliable for tab close)
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          const url = `${window.location.origin}/api/sessions/end`;
          navigator.sendBeacon(url, blob);
        } else {
          // Fallback to fetch with keepalive
          fetch('/api/sessions/end', {
            method: 'POST',
            body: payload,
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` })
            },
            keepalive: true
          }).catch(() => {
            // Ignore errors on tab close - backend cron will handle
          });
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeSession, sessionEvents, skipCount, repeatCount, sessionStartTime]);
  
  // Helper functions
  const _getMostFrequentCategory = () => {
    const categories = songsPlayed.map(s => s.category).filter(Boolean);
    if (categories.length === 0) return 'calm';
    
    const counts = {};
    categories.forEach(cat => {
      counts[cat] = (counts[cat] || 0) + 1;
    });
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'calm');
  };
  
  const _getAverageVolumeBucket = () => {
    if (volumeHistory.length === 0) return 'Medium';
    
    const avgVolume = volumeHistory.reduce((sum, v) => sum + v.volume, 0) / volumeHistory.length;
    if (avgVolume < 0.33) return 'Low';
    if (avgVolume < 0.67) return 'Medium';
    return 'High';
  };
  
  const _getSongDiversityBucket = () => {
    const uniqueCategories = new Set(songsPlayed.map(s => s.category).filter(Boolean)).size;
    if (uniqueCategories === 1) return 'One category';
    if (uniqueCategories <= 3) return '2-3 categories';
    return 'More than 3 categories';
  };
  
  const _calculateSessionLengthBucket = (startTime, endTime) => {
    const durationMinutes = (endTime - startTime) / (1000 * 60);
    if (durationMinutes < 10) return 'Less than 10 min';
    if (durationMinutes < 30) return '10-30 min';
    if (durationMinutes < 60) return '30-60 min';
    return 'More than 1 hour';
  };
  
  const _getListeningTimeOfDay = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 5 && hour < 11) return 'Morning (5am-11am)';
    if (hour >= 11 && hour < 15) return 'Afternoon (11am-3pm)';
    if (hour >= 15 && hour < 20) return 'Evening (3pm-8pm)';
    if (hour >= 20 && hour < 24) return 'Night (8pm-12am)';
    return 'Midnight (12am-5am)';
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);
  
  const value = {
    activeSession,
    sessionEvents,
    sessionStartTime,
    lastActivityTime,
    songsPlayed,
    songDurations,
    skipCount,
    repeatCount,
    volumeHistory,
    startSession,
    endSession,
    trackEvent,
    trackSongPlay,
    trackSongPause,
    trackSkip,
    trackRepeat,
    trackVolumeChange,
    updateActivity,
    isAdmin,
  };
  
  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

