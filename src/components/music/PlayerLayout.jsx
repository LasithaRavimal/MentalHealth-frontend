import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './PlayerSidebar';
import TopBar from './PlayerTopBar';
import PlayerBar from './player/PlayerBar';
import PlayerExpanded from './player/PlayerExpanded';
import PredictionModal from './session/PredictionModal';
import { usePlayer } from '../admin/music/context/PlayerContext';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const {
    currentSong,
    isPlaying,
    showExpanded,
    setShowExpanded,
    currentTime,
    setCurrentTime,
    duration,
    volume,
    handleVolumeChange,
    audioRef,
    showPredictionModal,
    setShowPredictionModal,
    prediction,
    handlePlayPause,
  } = usePlayer();