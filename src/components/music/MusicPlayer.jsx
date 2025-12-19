import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { usePlayer } from '../admin/music/context/PlayerContext';

const MusicPlayer = () => {
  const { user, logout } = useAuth();
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    audioRef,
    onPlaySong,
    handlePlayPause,
    handleSkip,
    handleRepeat,
    handleVolumeChange,
    showPredictionModal,
    setShowPredictionModal,
    prediction,
  } = usePlayer();

  const [songs, setSongs] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- Load Songs ---------------- */
  useEffect(() => {
    loadSongs();
    loadFavorites();
  }, [searchQuery, selectedCategory]);

  const loadSongs = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);

      const res = await apiClient.get(`/songs?${params}`);
      setSongs(res.data || []);
      setCategories([...new Set(res.data.map(s => s.category))]);
    } catch (err) {
      console.error('Failed to load songs', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await apiClient.get('/songs/favorites');
      setFavorites(new Set(res.data.song_ids));
    } catch (err) {
      console.error('Failed to load favorites', err);
    }
  };

  const toggleFavorite = async (songId) => {
    try {
      await apiClient.post(`/songs/${songId}/favorite`);
      setFavorites(prev => {
        const copy = new Set(prev);
        copy.has(songId) ? copy.delete(songId) : copy.add(songId);
        return copy;
      });
    } catch (err) {
      console.error('Favorite failed', err);
    }
  };

  const formatTime = (sec) => {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="flex h-screen bg-spotify-black text-white">

      {/* Sidebar */}
      <div className="w-64 bg-spotify-dark-gray p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-6">M_Track</h1>

        <div className="mb-6">
          <h3 className="text-xs text-gray-400 mb-2">Categories</h3>
          <button
            onClick={() => setSelectedCategory('')}
            className="block w-full text-left text-gray-300 hover:text-white mb-2"
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="block w-full text-left text-gray-300 hover:text-white mb-2"
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-auto border-t pt-4 text-sm text-gray-400">
          <p>{user?.email}</p>
          <button onClick={logout} className="hover:text-white mt-2">
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Song List */}
        <div className="flex-1 overflow-y-auto p-8">
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search songs..."
            className="mb-6 w-full bg-spotify-light-gray p-3 rounded"
          />

          {loading ? (
            <p>Loading...</p>
          ) : (
            songs.map(song => (
              <div
                key={song.id}
                onClick={() => onPlaySong(song)}
                className="flex items-center justify-between p-3 hover:bg-spotify-light-gray rounded cursor-pointer"
              >
                <div>
                  <p className="font-semibold">{song.title}</p>
                  <p className="text-xs text-gray-400">{song.artist}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(song.id);
                  }}
                >
                  {favorites.has(song.id) ? '💚' : '🤍'}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Player Bar */}
        {currentSong && (
          <div className="bg-spotify-light-gray p-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{currentSong.title}</p>
                <p className="text-xs text-gray-400">{currentSong.artist}</p>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={handleRepeat}>🔁</button>
                <button onClick={handleSkip}>⏭</button>
                <button onClick={handlePlayPause} className="bg-white text-black px-4 py-2 rounded">
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={e => handleVolumeChange(parseFloat(e.target.value))}
              />
            </div>

            <div className="flex items-center gap-2 mt-2 text-xs">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={e => (audioRef.current.currentTime = e.target.value)}
                className="flex-1"
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Prediction Modal */}
      {showPredictionModal && prediction && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-spotify-dark-gray p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">Session Analysis</h2>
            <p>Stress: {prediction.stress_level}</p>
            <p>Depression: {prediction.depression_level}</p>
            <button
              onClick={() => setShowPredictionModal(false)}
              className="mt-4 w-full bg-spotify-green py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <audio ref={audioRef} />
    </div>
  );
};

export default MusicPlayer;
