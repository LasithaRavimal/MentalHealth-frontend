import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../../../../api/apiClient';
import { useAuth } from '../../../../context/AuthContext';

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
    