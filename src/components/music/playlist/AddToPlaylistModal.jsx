import { useState, useEffect } from 'react';
import apiClient from '../../../api/apiClient';
import { MdClose, MdAdd, MdCheck, MdCreateNewFolder } from 'react-icons/md';
import { showSuccessToast, showErrorToast } from '../../../utils/notifications';

const AddToPlaylistModal = ({ isOpen, onClose, songId, onSuccess }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);

  useEffect(() => {
    if (isOpen && songId) {
      loadPlaylists();
    }
  }, [isOpen, songId]);

  const loadPlaylists = async () => {
    try {
      setLoadingPlaylists(true);
      const response = await apiClient.get('/playlists');
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Failed to load playlists:', error);
      showErrorToast('Failed to load playlists');
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      setLoading(true);
      await apiClient.post(`/playlists/${playlistId}/songs`, {
        song_id: songId
      });
      showSuccessToast('Song added to playlist!');
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Failed to add song to playlist:', error);
      showErrorToast(error.response?.data?.detail || 'Failed to add song to playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      showErrorToast('Please enter a playlist name');
      return;
    }

    try {
      setCreatingPlaylist(true);
      // Create playlist
      const createResponse = await apiClient.post('/playlists', {
        name: newPlaylistName.trim(),
        description: null
      });
      const newPlaylistId = createResponse.data.id;

      // Add song to new playlist
      await apiClient.post(`/playlists/${newPlaylistId}/songs`, {
        song_id: songId
      });

      showSuccessToast('Playlist created and song added!');
      setNewPlaylistName('');
      setShowCreateForm(false);
      await loadPlaylists();
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Failed to create playlist:', error);
      showErrorToast(error.response?.data?.detail || 'Failed to create playlist');
    } finally {
      setCreatingPlaylist(false);
    }
  };

  if (!isOpen || !songId) return null;

  return (
    <div 
      className="fixed inset-0 bg-spotify-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-spotify-dark-gray rounded-lg p-6 w-full max-w-md shadow-2xl border border-spotify-light-gray"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add to Playlist</h2>
          <button
            onClick={onClose}
            className="text-text-gray hover:text-white transition-colors p-2 hover:bg-spotify-light-gray rounded-full"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Create New Playlist Form */}
        {showCreateForm ? (
          <form onSubmit={handleCreateAndAdd} className="mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                Playlist Name
              </label>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Enter playlist name"
                className="w-full bg-spotify-light-gray px-4 py-3 rounded-lg text-white placeholder-text-gray focus:outline-none focus:ring-2 focus:ring-spotify-green"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewPlaylistName('');
                }}
                className="flex-1 px-4 py-2 bg-spotify-gray hover:bg-spotify-light-gray text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingPlaylist || !newPlaylistName.trim()}
                className="flex-1 px-4 py-2 bg-spotify-green hover:bg-spotify-green-hover text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingPlaylist ? 'Creating...' : 'Create & Add'}
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full mb-6 px-4 py-3 bg-spotify-light-gray hover:bg-spotify-gray text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <MdCreateNewFolder className="w-5 h-5" />
            Create New Playlist
          </button>
        )}

        {/* Playlists List */}
        <div className="max-h-96 overflow-y-auto">
          {loadingPlaylists ? (
            <div className="text-center py-8 text-text-gray">Loading playlists...</div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-gray mb-4">No playlists yet</p>
              <p className="text-sm text-text-gray">Create your first playlist above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-spotify-light-gray hover:bg-spotify-gray text-white rounded-lg transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{playlist.name}</div>
                    {playlist.description && (
                      <div className="text-sm text-text-gray">{playlist.description}</div>
                    )}
                    <div className="text-xs text-text-gray mt-1">
                      {playlist.song_ids?.length || 0} songs
                    </div>
                  </div>
                  <MdAdd className="w-5 h-5 text-spotify-green flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;

