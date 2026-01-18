import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
//import PlaylistCard from './PlaylistCard';
//import PlaylistModal from './PlaylistModal';
import apiClient from '../../../api/apiClient';

const PlaylistList = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const response = await apiClient.get('/playlists');
      setPlaylists(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load playlists:', error);
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPlaylist(null);
    setShowModal(true);
  };

  const handleEdit = (playlist) => {
    setEditingPlaylist(playlist);
    setShowModal(true);
  };

  const handleDelete = async (playlistId) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await apiClient.delete(`/playlists/${playlistId}`);
      await loadPlaylists();
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      alert('Failed to delete playlist');
    }
  };

  const handleModalSuccess = () => {
    loadPlaylists();
  };

  if (loading) {
    return <div className="text-text-gray">Loading playlists...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Your Playlists</h2>
        <button
          onClick={handleCreate}
          className="btn-primary px-6 py-3 rounded-lg font-semibold"
        >
          + Create Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-20 bg-spotify-light-gray rounded-lg">
          <div className="max-w-md mx-auto">
            <div className="w-32 h-32 bg-gradient-to-br from-spotify-green/20 to-spotify-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Create your first playlist</h3>
            <p className="text-text-gray mb-8">
              It's easy, we'll help you. Add songs you love or pick a ready-made playlist.
            </p>
            <button
              onClick={handleCreate}
              className="btn-primary px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform"
            >
              Create Playlist
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="relative group">
              {/* //<PlaylistCard playlist={playlist} showAddButton={true} /> */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(playlist);
                  }}
                  className="w-8 h-8 bg-spotify-green text-white rounded-full flex items-center justify-center text-sm hover:bg-spotify-green-hover"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(playlist.id);
                  }}
                  className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* <PlaylistModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPlaylist(null);
        }}
        onSuccess={handleModalSuccess}
        playlist={editingPlaylist}
      /> */}
    </div>
  );
};

export default PlaylistList;

