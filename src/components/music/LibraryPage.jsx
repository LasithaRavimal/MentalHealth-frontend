import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './PlayerSidebar';
import TopBar from './PlayerTopBar';
import SongCard from './songs/SongCard';
import PlaylistCard from './playlist/PlaylistCard';
import PlayerBar from './player/PlayerBar';
import PlaylistModal from './playlist/PlaylistModal';
import apiClient from '../../api/apiClient';
import { usePlayer } from '../music/context/PlayerContext';
import { MdLibraryMusic, MdPlaylistPlay, MdSearch, MdFavorite, MdFavoriteBorder } from 'react-icons/md';

const LibraryPage = () => {
  const navigate = useNavigate();
  const { onPlaySong } = usePlayer();
  const [favoriteSongs, setFavoriteSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('favorites'); // 'favorites' or 'playlists'
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadFavorites(), loadPlaylists()]);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const favoritesResponse = await apiClient.get('/songs/favorites');
      const favoriteIds = favoritesResponse.data.song_ids || [];
      
      if (favoriteIds.length > 0) {
        const songsResponse = await apiClient.get('/songs');
        const allSongs = songsResponse.data || [];
        const favorites = allSongs.filter(song => favoriteIds.includes(song.id));
        setFavoriteSongs(favorites);
      } else {
        setFavoriteSongs([]);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      setFavoriteSongs([]);
    }
  };

  const loadPlaylists = async () => {
    try {
      const response = await apiClient.get('/playlists');
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Failed to load playlists:', error);
      setPlaylists([]);
    }
  };

  const handleSongPlay = (song) => {
    if (onPlaySong) {
      onPlaySong(song);
    }
  };

  const handlePlaylistClick = (playlistId) => {
    navigate(`/playlist/${playlistId}`);
  };

  const handleCreatePlaylist = () => {
    setShowPlaylistModal(true);
  };

  const handleModalSuccess = () => {
    loadPlaylists();
    setShowPlaylistModal(false);
  };

  const filteredFavorites = favoriteSongs.filter(song => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query)
    );
  });

  const filteredPlaylists = playlists.filter(playlist => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return playlist.name.toLowerCase().includes(query);
  });

  const categories = [...new Set(favoriteSongs.map(s => s.category).filter(Boolean))];

  return (
    <div className="flex h-screen bg-spotify-black overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden bg-spotify-dark-gray pb-24">
        <TopBar />

        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-spotify-dark-gray to-spotify-black">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-6">Your Library</h1>
            
            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6 border-b border-spotify-light-gray">
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
                  activeTab === 'favorites'
                    ? 'text-white border-spotify-green'
                    : 'text-text-gray border-transparent hover:text-white'
                }`}
              >
                Liked Songs
              </button>
              <button
                onClick={() => setActiveTab('playlists')}
                className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
                  activeTab === 'playlists'
                    ? 'text-white border-spotify-green'
                    : 'text-text-gray border-transparent hover:text-white'
                }`}
              >
                Playlists
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md mb-6">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-gray text-xl" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab === 'favorites' ? 'liked songs' : 'playlists'}...`}
                className="w-full bg-spotify-light-gray px-4 py-3 pl-10 rounded-lg text-white placeholder-text-gray focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-spotify-green border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-text-gray">Loading your library...</p>
            </div>
          ) : activeTab === 'favorites' ? (
            <>
              {filteredFavorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-24 h-24 bg-spotify-gray rounded-full flex items-center justify-center mb-6">
                    <MdFavoriteBorder className="w-12 h-12 text-text-gray" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No liked songs yet</h3>
                  <p className="text-text-gray text-center max-w-md mb-6">
                    {searchQuery
                      ? `No songs match "${searchQuery}" in your liked songs`
                      : 'Songs you like will appear here. Start liking songs to build your collection.'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => navigate('/search')}
                      className="btn-primary px-6 py-3 rounded-full font-semibold"
                    >
                      Explore Music
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-4">
                      Liked Songs ({filteredFavorites.length})
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {filteredFavorites.map((song) => (
                        <SongCard key={song.id} song={song} onPlay={handleSongPlay} />
                      ))}
                    </div>
                  </div>

                  {/* Categories from favorites */}
                  {categories.length > 0 && !searchQuery && (
                    <div className="mt-12">
                      <h2 className="text-2xl font-bold text-white mb-4">Browse by Category</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categories.map((category) => (
                          <div
                            key={category}
                            onClick={() => navigate(`/category/${encodeURIComponent(category)}`)}
                            className="bg-gradient-to-br from-spotify-green to-spotify-green-dark rounded-lg p-6 hover:scale-105 transition-transform cursor-pointer"
                          >
                            <div className="text-white font-bold text-xl">{category}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Playlists ({filteredPlaylists.length})
                </h2>
                <button
                  onClick={handleCreatePlaylist}
                  className="btn-primary px-6 py-3 rounded-full font-semibold"
                >
                  + Create Playlist
                </button>
              </div>

              {filteredPlaylists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-24 h-24 bg-spotify-gray rounded-full flex items-center justify-center mb-6">
                    <MdPlaylistPlay className="w-12 h-12 text-text-gray" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No playlists yet</h3>
                  <p className="text-text-gray text-center max-w-md mb-6">
                    {searchQuery
                      ? `No playlists match "${searchQuery}"`
                      : 'Create playlists to organize your music. Start by creating your first playlist.'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={handleCreatePlaylist}
                      className="btn-primary px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform"
                    >
                      Create Playlist
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {filteredPlaylists.map((playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <PlayerBar />

      {showPlaylistModal && (
        <PlaylistModal
          isOpen={showPlaylistModal}
          onClose={() => setShowPlaylistModal(false)}
          onSuccess={handleModalSuccess}
          playlist={null}
        />
      )}
    </div>
  );
};

export default LibraryPage;

