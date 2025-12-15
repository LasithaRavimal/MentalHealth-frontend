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
    <div className="min-h-screen bg-gradient-to-b from-spotify-dark-gray to-spotify-black flex flex-col items-center justify-center p-6 text-center relative">

      {/* Profile button */}
      {user && (
        <div className="absolute top-6 right-6" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu((s) => !s)}
            className="flex items-center gap-2 bg-spotify-dark-gray/60 hover:bg-spotify-dark-gray/80 border border-spotify-gray px-3 py-2 rounded-full shadow-md transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-spotify-green flex items-center justify-center text-white font-semibold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:inline text-white text-sm truncate max-w-[8rem]">
              {user?.email?.split('@')[0]}
            </span>
          </button>

          {showProfileMenu && (
            <div className="mt-2 w-44 bg-spotify-light-gray rounded-lg shadow-2xl border border-spotify-gray py-2 text-left">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/profile');
                }}
                className="w-full px-3 py-2 flex items-center gap-3 hover:bg-spotify-dark-gray text-white"
              >
                <MdPerson />
                Profile
              </button>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/profile-settings');
                }}
                className="w-full px-3 py-2 flex items-center gap-3 hover:bg-spotify-dark-gray text-white"
              >
                <MdSettings />
                Settings
              </button>

              <div className="border-t border-spotify-gray my-1" />

              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 flex items-center gap-3 hover:bg-spotify-dark-gray text-white"
              >
                <MdLogout />
                Logout
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main content */}
      <div className="max-w-3xl w-full space-y-10">
        <div>
          <h1 className="text-5xl md:text-7xl font-bold text-white">
            Welcome to <span className="text-spotify-green">M_Track</span>
          </h1>
          <p className="text-lg text-text-gray mt-4 max-w-xl mx-auto">
            Early mental-health detection using Face, Voice, EEG, and Music behavior analysis.
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => navigate(routes.face)}
            className="p-6 rounded-xl bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 border border-white/5"
          >
            <span className="block text-white font-semibold">Face</span>
            <span className="text-text-gray text-sm">Facial stress detection</span>
          </button>

          <button
            onClick={() => navigate(routes.voice)}
            className="p-6 rounded-xl bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 border border-white/5"
          >
            <span className="block text-white font-semibold">Voice</span>
            <span className="text-text-gray text-sm">Voice-based analysis</span>
          </button>

          <button
            onClick={() => navigate(routes.eeg)}
            className="p-6 rounded-xl bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 border border-white/5"
          >
            <span className="block text-white font-semibold">EEG</span>
            <span className="text-text-gray text-sm">EEG signal detection</span>
          </button>

          <button
            onClick={() => navigate(routes.music)}
            className="p-6 rounded-xl bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 border border-white/5"
          >
            <span className="block text-white font-semibold">Music</span>
            <span className="text-text-gray text-sm">Open music player</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
