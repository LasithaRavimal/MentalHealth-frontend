import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdAccountCircle, MdSettings, MdLogout, MdPerson } from 'react-icons/md';

const TopBar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/player?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    navigate('/login');
  };

  return (
    <div className="bg-spotify-dark-gray border-b border-spotify-light-gray px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What do you want to play?"
            className="w-full px-4 py-2 pl-10 pr-4 bg-spotify-light-gray border border-transparent rounded-full text-white placeholder-text-gray focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-text-gray"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </form>

      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        <button
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          className="focus:outline-none"
        >
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.email}
              className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 ring-spotify-green transition-all"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-spotify-green flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-spotify-green-hover transition-colors">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </button>

        {/* Profile Dropdown Menu */}
        {showProfileDropdown && (
          <div className="absolute right-0 top-12 w-56 bg-spotify-light-gray rounded-lg shadow-2xl py-2 z-50 border border-spotify-gray">
            <div className="px-4 py-3 border-b border-spotify-gray">
              <div className="text-sm font-semibold text-white truncate">
                {user?.email || 'User'}
              </div>
              <div className="text-xs text-text-gray mt-1">
                {isAdmin ? 'Administrator' : 'Free Account'}
              </div>
            </div>
            
            <div className="py-2">
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  navigate('/profile-musicprofile');
                }}
                className="w-full px-4 py-2 text-sm text-white hover:bg-spotify-gray flex items-center gap-3 transition-colors"
              >
                <MdPerson className="text-xl" />
                <span>Profile</span>
              </button>
              
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  navigate('/musicprofile-settings');
                }}
                className="w-full px-4 py-2 text-sm text-white hover:bg-spotify-gray flex items-center gap-3 transition-colors"
              >
                <MdSettings className="text-xl" />
                <span>Settings</span>
              </button>
              
              {isAdmin && (
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate('/admin');
                  }}
                  className="w-full px-4 py-2 text-sm text-white hover:bg-spotify-gray flex items-center gap-3 transition-colors"
                >
                  <MdAccountCircle className="text-xl" />
                  <span>Admin Panel</span>
                </button>
              )}
            </div>
            
            <div className="border-t border-spotify-gray py-2">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-white hover:bg-spotify-gray flex items-center gap-3 transition-colors"
              >
                <MdLogout className="text-xl" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;

