import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdPerson, MdSettings, MdLogout } from 'react-icons/md';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Profile dropdown state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/login');
  };

  // Routes
  const routes = {
    face: '/face',
    voice: '/voice',
    eeg: '/eeg',
    music: '/musichome',
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gradient-to-b from-spotify-dark-gray to-spotify-black">

      {/* Profile button */}
      {user && (
        <div className="absolute top-6 right-6" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu((s) => !s)}
            className="flex items-center gap-2 px-3 py-2 transition-colors border rounded-full shadow-md bg-spotify-dark-gray/60 hover:bg-spotify-dark-gray/80 border-spotify-gray"
          >
            <div className="flex items-center justify-center w-8 h-8 font-semibold text-white rounded-full bg-spotify-green">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:inline text-white text-sm truncate max-w-[8rem]">
              {user?.email?.split('@')[0]}
            </span>
          </button>

          {showProfileMenu && (
            <div className="py-2 mt-2 text-left border rounded-lg shadow-2xl w-44 bg-spotify-light-gray border-spotify-gray">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/profile');
                }}
                className="flex items-center w-full gap-3 px-3 py-2 text-white hover:bg-spotify-dark-gray"
              >
                <MdPerson />
                Profile
              </button>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/profile-settings');
                }}
                className="flex items-center w-full gap-3 px-3 py-2 text-white hover:bg-spotify-dark-gray"
              >
                <MdSettings />
                Settings
              </button>

              <div className="my-1 border-t border-spotify-gray" />

              <button
                onClick={handleLogout}
                className="flex items-center w-full gap-3 px-3 py-2 text-white hover:bg-spotify-dark-gray"
              >
                <MdLogout />
                Logout
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main content */}
      <div className="w-full max-w-3xl space-y-10">
        <div>
          <h1 className="text-5xl font-bold text-white md:text-7xl">
            Welcome to <span className="text-spotify-green">M_Track</span>
          </h1>
          <p className="max-w-xl mx-auto mt-4 text-lg text-text-gray">
            Early mental-health detection using Face, Voice, EEG, and Music behavior analysis.
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => navigate(routes.face)}
            className="p-6 border rounded-xl bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 border-white/5"
          >
            <span className="block font-semibold text-white">Face</span>
            <span className="text-sm text-text-gray">Facial Emotion detection</span>
          </button>

          <button
            onClick={() => navigate(routes.voice)}
            className="p-6 border rounded-xl bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 border-white/5"
          >
            <span className="block font-semibold text-white">Voice</span>
            <span className="text-sm text-text-gray">Voice-based analysis</span>
          </button>

          <button
            onClick={() => navigate(routes.eeg)}
            className="p-6 border rounded-xl bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 border-white/5"
          >
            <span className="block font-semibold text-white">EEG</span>
            <span className="text-sm text-text-gray">EEG signal detection</span>
          </button>

          <button
            onClick={() => navigate(routes.music)}
            className="p-6 border rounded-xl bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 border-white/5"
          >
            <span className="block font-semibold text-white">Music</span>
            <span className="text-sm text-text-gray">Open music player</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
