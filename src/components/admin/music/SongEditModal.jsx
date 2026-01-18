import { useState, useEffect } from 'react';
import apiClient from '../../../api/apiClient';
import { SONG_CATEGORIES } from './constants/categories';

const SongEditModal = ({ song, onClose, onSave }) => {
  const [title, setTitle] = useState(song?.title || '');
  const [artist, setArtist] = useState(song?.artist || '');
  const [category, setCategory] = useState(song?.category || '');
  const [description, setDescription] = useState(song?.description || '');
  const [isActive, setIsActive] = useState(song?.is_active !== undefined ? song.is_active : true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (song) {
      setTitle(song.title || '');
      setArtist(song.artist || '');
      setCategory(song.category || '');
      setDescription(song.description || '');
      setIsActive(song.is_active !== undefined ? song.is_active : true);
    }
  }, [song]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !artist || !category) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiClient.put(`/songs/${song.id}`, {
        title,
        artist,
        category,
        description: description || null,
        is_active: isActive,
      });

      if (onSave) {
        onSave();
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update song');
    } finally {
      setLoading(false);
    }
  };

  if (!song) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card-bg rounded-lg p-6 max-w-md w-full mx-4 shadow-elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">Edit Song</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-light w-full px-4 py-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Artist *
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
              className="input-light w-full px-4 py-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Category *
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="input-light w-full px-4 py-2 pr-10 rounded-lg appearance-none cursor-pointer"
              >
                <option value="" disabled className="bg-gray-800 text-gray-500">
                  Select a category
                </option>
                {SONG_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-800 text-white">
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-light w-full px-4 py-2 rounded-lg resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-border-light text-spotify-green focus:ring-spotify-green"
              />
              <span className="text-sm font-medium text-text-primary">
                Active (Visible to users)
              </span>
            </label>
            <p className="text-xs text-text-secondary mt-1 ml-8">
              {isActive ? 'Song is visible to all users' : 'Song is hidden from users'}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border-light rounded-lg text-text-primary hover:bg-bg-tertiary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SongEditModal;

