import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../PlayerSidebar';
import TopBar from '../PlayerTopBar';
import SongCard from '../songs/SongCard';
import PlayerBar from '../player/PlayerBar';
import apiClient from '../../../api/apiClient';
import { useAuth } from '../../../context/AuthContext';

const PlaylistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadPlaylist();
    }
  }, [id]);

  const loadPlaylist = async () => {
    try {
      const response = await apiClient.get(`/playlists/${id}`);
      setPlaylist(response.data);
      
      // Load songs in playlist
      if (response.data.song_ids?.length > 0) {
        const songsResponse = await Promise.all(
          response.data.song_ids.map(songId => 
            apiClient.get(`/songs`).then(res => 
              res.data.find(s => s.id === songId)
            ).catch(() => null)
          )
        );
        setSongs(songsResponse.filter(Boolean));
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load playlist');
      setLoading(false);
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      await apiClient.delete(`/playlists/${id}/songs/${songId}`);
      setSongs(songs.filter(s => s.id !== songId));
      if (playlist) {
        setPlaylist({
          ...playlist,
          song_ids: playlist.song_ids.filter(id => id !== songId)
        });
      }
    } catch (err) {
      console.error('Failed to remove song:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-bg-secondary">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-text-secondary">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="flex h-screen bg-bg-secondary">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-text-primary">{error || 'Playlist not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg-secondary overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-text-primary mb-2">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-text-secondary">{playlist.description}</p>
            )}
            <p className="text-sm text-text-tertiary mt-2">
              {songs.length} {songs.length === 1 ? 'song' : 'songs'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {songs.length === 0 ? (
              <div className="col-span-full text-center text-text-secondary py-12">
                No songs in this playlist yet
              </div>
            ) : (
              songs.map((song) => (
                <div key={song.id} className="relative">
                  <SongCard song={song} />
                  <button
                    onClick={() => handleRemoveSong(song.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <PlayerBar />
    </div>
  );
};

export default PlaylistPage;

