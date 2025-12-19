import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './PlayerLayout';
import SongCard from './songs/SongCard';
import PlaylistList from './playlist/PlaylistList';
import apiClient from '../../api/apiClient';
import { usePlayer } from '../admin/music/context/PlayerContext';

const MusicPlayerHomeContent = () => {
  const navigate = useNavigate();
  const { onPlaySong } = usePlayer();

  const [songs, setSongs] = useState([]);
  const [featuredSongs, setFeaturedSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      const response = await apiClient.get('/songs');
      const allSongs = response.data || [];

      setSongs(allSongs);
      setFeaturedSongs(allSongs.slice(0, 6));
    } catch (error) {
      console.error('Failed to load songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(songs.map(song => song.category))];

  const handleSongPlay = (song) => {
    onPlaySong(song); // ✅ Session starts INSIDE PlayerContext
  };
  
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-spotify-dark-gray to-spotify-black">

    
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Recommended for you</h2>
          <button
            onClick={() => navigate('/search')}
            className="text-sm text-text-gray hover:text-white hover:underline"
          >
            Show all
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {loading ? (
            <div className="col-span-6 flex flex-col items-center py-16">
              <div className="w-16 h-16 border-4 border-spotify-green border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-text-gray">Loading your music...</p>
            </div>
          ) : featuredSongs.length === 0 ? (
            <div className="col-span-6 text-center py-16 bg-spotify-light-gray rounded-lg">
              <h3 className="text-xl font-bold text-white mb-2">No songs available</h3>
              <p className="text-text-gray">Add songs to get recommendations</p>
            </div>
          ) : (
            featuredSongs.map(song => (
              <SongCard
                key={song.id}
                song={song}
                onPlay={() => handleSongPlay(song)}
              />
            ))
          )}
        </div>
      </div>

      {/* ================= Featured Charts ================= */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-6">Featured Charts</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.slice(0, 3).map(category => {
            const categorySongs = songs.filter(s => s.category === category);

            return (
              <div
                key={category}
                onClick={() => navigate(`/category/${encodeURIComponent(category)}`)}
                className="bg-spotify-light-gray rounded-lg p-6 hover:bg-spotify-gray cursor-pointer"
              >
                <h3 className="text-xl font-bold text-white mb-4">{category}</h3>
                {categorySongs.slice(0, 3).map((song, idx) => (
                  <div key={song.id} className="flex gap-3 text-sm text-white">
                    <span className="text-text-gray">{idx + 1}</span>
                    <span className="truncate">{song.title}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= Playlists ================= */}
      <div className="mb-12">
        <PlaylistList />
      </div>