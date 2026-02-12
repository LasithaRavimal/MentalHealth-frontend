import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './PlayerSidebar';
import TopBar from './PlayerTopBar';
import SongCard from './songs/SongCard';
import PlayerBar from './player/PlayerBar';
import apiClient from '../../api/apiClient';
import { usePlayer } from '../music/context/PlayerContext';
import { MdArrowBack, MdSearch, MdPlayArrow } from 'react-icons/md';



const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { onPlaySong } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSongs();
  }, [categoryName]);

  const loadSongs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/songs', {
        params: { category: categoryName }
      });
      setSongs(response.data || []);
    } catch (error) {
      console.error('Failed to load songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSongPlay = (song) => {
    if (onPlaySong) {
      onPlaySong(song);
    }
  };

  const filteredSongs = songs.filter(song => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query)
    );
  });

  const getThumbnailUrl = (thumbnailUrl) => {
    if (!thumbnailUrl) return null;
    if (thumbnailUrl.startsWith('http')) {
      return thumbnailUrl;
    }
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${apiBaseUrl}${thumbnailUrl}`;
  };

  return (
    <div className="flex h-screen bg-spotify-black overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden bg-spotify-dark-gray pb-24">
        <TopBar />

        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-spotify-dark-gray to-spotify-black">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-text-gray hover:text-white mb-4 flex items-center gap-2 transition-colors"
            >
              <MdArrowBack className="text-xl" />
              <span>Back</span>
            </button>
            
            <div className="flex items-end gap-6 mb-6">
              <div className="w-56 h-56 bg-gradient-to-br from-spotify-green to-spotify-green-dark rounded-lg shadow-2xl flex items-center justify-center">
                <span className="text-8xl font-bold text-white">{categoryName?.charAt(0) || '🎵'}</span>
              </div>
              <div className="flex-1 pb-4">
                <h1 className="text-6xl font-bold text-white mb-2">{categoryName}</h1>
                <p className="text-lg text-text-gray">{songs.length} songs</p>
              </div>
            </div>

            {/* Play Button */}
            {songs.length > 0 && (
              <button
                onClick={() => handleSongPlay(songs[0])}
                className="w-14 h-14 bg-spotify-green hover:bg-spotify-green-hover rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform mb-6"
              >
                <MdPlayArrow className="text-3xl text-spotify-black ml-1" />
              </button>
            )}

            {/* Search Bar */}
            <div className="relative max-w-md mb-6">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-gray text-xl" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${categoryName}...`}
                className="w-full bg-spotify-light-gray px-4 py-3 pl-10 rounded-lg text-white placeholder-text-gray focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
            </div>
          </div>

          {/* Songs Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-spotify-green border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-text-gray">Loading songs...</p>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 bg-spotify-gray rounded-full flex items-center justify-center mb-6">
                <MdSearch className="w-12 h-12 text-text-gray" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No songs found</h3>
              <p className="text-text-gray text-center max-w-md">
                {searchQuery
                  ? `No songs match "${searchQuery}" in ${categoryName}`
                  : `No songs available in ${categoryName} category`}
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {searchQuery ? `Search Results (${filteredSongs.length})` : 'All Songs'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredSongs.map((song) => (
                  <SongCard key={song.id} song={song} onPlay={handleSongPlay} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <PlayerBar />
    </div>
  );
};

export default CategoryPage;

