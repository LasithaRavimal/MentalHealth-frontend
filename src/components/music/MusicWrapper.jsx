import { SessionProvider } from '../admin/music/context/SessionContext';
import { PlayerProvider } from '../admin/music/context/PlayerContext';

const MusicWrapper = ({ children }) => {
  return (
    <SessionProvider>
      <PlayerProvider>
        {children}
      </PlayerProvider>
    </SessionProvider>
  );
};

export default MusicWrapper;
