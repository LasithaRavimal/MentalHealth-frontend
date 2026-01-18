import { SessionProvider } from '../music/context/SessionContext';
import { PlayerProvider } from '../music/context/PlayerContext';

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
