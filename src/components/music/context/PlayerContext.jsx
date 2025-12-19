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