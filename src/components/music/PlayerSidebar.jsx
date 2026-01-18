import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { 
  MdHome, 
  MdSearch, 
  MdLibraryMusic, 
  MdPlaylistPlay,
  MdDashboard,
  MdMusicNote,
  MdPeople,
  MdAnalytics,
  MdExpandMore,
  MdExpandLess,
  MdAdd
} from 'react-icons/md';

const Sidebar = () => {
  const { isAdmin, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [playlists, setPlaylists] = useState([]);
  const [playlistsExpanded, setPlaylistsExpanded] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (!isAdmin) {
      loadCategories();
      loadPlaylists();
    }
  }, [isAdmin]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await apiClient.get('/songs/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadPlaylists = async () => {
    try {
      setLoadingPlaylists(true);
      const response = await apiClient.get('/playlists');
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Failed to load playlists:', error);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/category/${encodeURIComponent(category)}`);
  };

  const handlePlaylistClick = (playlistId) => {
    navigate(`/playlist/${playlistId}`);
  };

  const userMenuItems = [
    { path: '/landing', icon: MdHome, label: 'Back to Home' },
    { path: '/musichome', icon: MdHome, label: 'MusicPlayerHome' },
    { path: '/search', icon: MdSearch, label: 'Search' },
    { path: '/library', icon: MdLibraryMusic, label: 'Your Library' },
    { path: '/playlists', icon: MdPlaylistPlay, label: 'Playlists' },
  ];

  const adminMenuItems = [
    { path: '/admin', icon: MdDashboard, label: 'Dashboard' },
    { path: '/admin/songs', icon: MdMusicNote, label: 'Song Management' },
    { path: '/admin/users', icon: MdPeople, label: 'User Management' },
    { path: '/admin/analytics', icon: MdAnalytics, label: 'Analytics' },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <div className="w-64 bg-spotify-black border-r border-spotify-light-gray h-screen flex flex-col pb-[90px]">
      {/* Logo */}
      <div className="p-6 border-b border-spotify-light-gray">
        <h1 className="text-2xl font-bold text-white">
          <span className="text-spotify-green">M</span>_Track
        </h1>
        <p className="text-xs text-text-gray mt-1">Music Behavior Analysis</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto pb-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-spotify-light-gray text-white font-bold'
                    : 'text-text-gray hover:text-white hover:bg-spotify-dark-gray'
                }`}
              >
                <item.icon className="text-2xl" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Playlists Section (for users only) */}
        {!isAdmin && (
          <div className="mt-8">
            <div className="flex items-center justify-between px-4 mb-3">
              <h3 className="text-xs font-bold text-text-gray uppercase tracking-wider">
                Your Playlists
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/playlists')}
                  className="text-text-gray hover:text-white transition-colors p-1"
                  title="Create Playlist"
                >
                  <MdAdd className="text-lg" />
                </button>
                <button
                  onClick={() => setPlaylistsExpanded(!playlistsExpanded)}
                  className="text-text-gray hover:text-white transition-colors p-1"
                >
                  {playlistsExpanded ? (
                    <MdExpandLess className="text-lg" />
                  ) : (
                    <MdExpandMore className="text-lg" />
                  )}
                </button>
              </div>
            </div>
            {playlistsExpanded && (
              <div className="space-y-1">
                {loadingPlaylists ? (
                  <div className="px-4 py-2 text-sm text-text-gray">Loading playlists...</div>
                ) : playlists.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-text-gray">No playlists yet</div>
                ) : (
                  playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => handlePlaylistClick(playlist.id)}
                      className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${
                        location.pathname === `/playlist/${playlist.id}`
                          ? 'bg-spotify-light-gray text-white font-bold'
                          : 'text-text-gray hover:text-white hover:bg-spotify-dark-gray'
                      }`}
                    >
                      {playlist.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Categories Section (for users only) */}
        {!isAdmin && (
          <div className="mt-8">
            <div className="flex items-center justify-between px-4 mb-3">
              <h3 className="text-xs font-bold text-text-gray uppercase tracking-wider">
                Categories
              </h3>
              <button
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className="text-text-gray hover:text-white transition-colors p-1"
              >
                {categoriesExpanded ? (
                  <MdExpandLess className="text-lg" />
                ) : (
                  <MdExpandMore className="text-lg" />
                )}
              </button>
            </div>
            {categoriesExpanded && (
              <div className="space-y-1">
                {loadingCategories ? (
                  <div className="px-4 py-2 text-sm text-text-gray">Loading categories...</div>
                ) : categories.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-text-gray">No categories available</div>
                ) : (
                  categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${
                        location.pathname === `/category/${encodeURIComponent(cat)}`
                          ? 'bg-spotify-light-gray text-white font-bold'
                          : 'text-text-gray hover:text-white hover:bg-spotify-dark-gray'
                      }`}
                    >
                      {cat}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </nav>

    </div>
  );
};

export default Sidebar;

