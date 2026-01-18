import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './PlayerSidebar';
import TopBar from './PlayerTopBar';
import PlayerBar from './player/PlayerBar';
import PlayerExpanded from './player/PlayerExpanded';
import PredictionModal from './session/PredictionModal';
import { usePlayer } from '../music/context/PlayerContext';

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

  return (
    <div className="flex h-screen bg-spotify-black overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden bg-spotify-dark-gray pb-24">
        <TopBar />
        {children}
      </div>

      <PlayerBar />

      {showExpanded && currentSong && (
        <PlayerExpanded
          song={currentSong}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onClose={() => setShowExpanded(false)}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          onSeek={(time) => {
            if (audioRef.current) {
              audioRef.current.currentTime = time;
            }
            setCurrentTime(time);
          }}
        />
      )}

      {showPredictionModal && prediction && (
        <PredictionModal
          isOpen={showPredictionModal}
          onClose={() => setShowPredictionModal(false)}
          prediction={prediction}
          onViewHistory={() => {
            setShowPredictionModal(false);
            navigate('/sessions');
          }}
        />
      )}
    </div>
  );
};

export default Layout;

