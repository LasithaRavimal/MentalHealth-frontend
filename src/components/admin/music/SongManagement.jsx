import { useState, useEffect, useMemo } from 'react';
import AdminSidebar from './AdminSidebar';
import SongEditModal from '../music/SongEditModal';
import apiClient from '../../../api/apiClient';
import { SONG_CATEGORIES } from '../../../constants/categories';
import { showSuccessToast, showErrorToast, showWarningToast } from '../../../utils/notifications';
import { MdSearch, MdFilterList, MdVisibility, MdVisibilityOff, MdImage } from 'react-icons/md';

const SongManagement = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [editingSong, setEditingSong] = useState(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all'); // 'all', 'active', 'inactive'
  
  // Upload form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/songs');
      setSongs(response.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load songs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter songs based on search, category, and visibility
  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          song.title?.toLowerCase().includes(query) ||
          song.artist?.toLowerCase().includes(query) ||
          song.category?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Category filter
      if (selectedCategory && song.category !== selectedCategory) {
        return false;
      }
      
      // Visibility filter
      if (visibilityFilter === 'active' && !song.is_active) {
        return false;
      }
      if (visibilityFilter === 'inactive' && song.is_active) {
        return false;
      }
      
      return true;
    });
  }, [songs, searchQuery, selectedCategory, visibilityFilter]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleThumbnailChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title || !artist || !category) {
      showWarningToast('Please fill all required fields');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('artist', artist);
      formData.append('category', category);
      if (description) formData.append('description', description);
      if (thumbnail) formData.append('thumbnail', thumbnail);

      await apiClient.post('/songs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form
      setTitle('');
      setArtist('');
      setCategory('');
      setDescription('');
      setFile(null);
      setThumbnail(null);
      setThumbnailPreview(null);
      
      await loadSongs();
      showSuccessToast('Song uploaded successfully! 🎵');
    } catch (err) {
      showErrorToast(err.response?.data?.detail || 'Upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (songId) => {
    if (!confirm('Are you sure you want to delete this song?')) return;

    try {
      await apiClient.delete(`/songs/${songId}`);
      await loadSongs();
      showSuccessToast('Song deleted successfully');
    } catch (err) {
      showErrorToast(err.response?.data?.detail || 'Delete failed. Please try again.');
      console.error(err);
    }
  };

  const handleToggleVisibility = async (songId) => {
    try {
      await apiClient.patch(`/songs/${songId}/toggle-visibility`);
      await loadSongs();
      showSuccessToast('Song visibility updated');
    } catch (err) {
      showErrorToast(err.response?.data?.detail || 'Failed to update visibility.');
      console.error(err);
    }
  };

  const handleEdit = (song) => {
    setEditingSong(song);
  };

  const handleEditSave = async () => {
    await loadSongs();
    setEditingSong(null);
  };

  const getThumbnailUrl = (thumbnailUrl) => {
    if (!thumbnailUrl) return null;
    // If it's a full URL, return as is, otherwise prepend API base URL
    if (thumbnailUrl.startsWith('http')) {
      return thumbnailUrl;
    }
    // Use the API base URL from the environment or default to localhost:8000
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${apiBaseUrl}${thumbnailUrl}`;
  };

  return (
    <div className="flex h-screen bg-bg-secondary overflow-hidden">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-bg-primary border-b border-border-light px-6 py-4">
          <h1 className="text-2xl font-bold text-text-primary">Song Management</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {/* Upload Form */}
          <div className="bg-card-bg rounded-lg p-6 shadow-card mb-8">
            <h2 className="text-xl font-bold text-text-primary mb-4">Upload New Song</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Song title"
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
                    placeholder="Artist name"
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
                    Audio File *
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    required
                    className="input-light w-full px-4 py-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Thumbnail (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="input-light w-full px-4 py-2 rounded-lg"
                  />
                  {thumbnailPreview && (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="mt-2 w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="input-light w-full px-4 py-2 rounded-lg resize-none"
                    placeholder="Song description..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="btn-primary w-full px-4 py-3 rounded-lg disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Song'}
              </button>
            </form>
          </div>

          {/* Songs List */}
          <div className="bg-card-bg rounded-lg p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">All Songs</h2>
              <div className="text-sm text-text-secondary">
                Showing {filteredSongs.length} of {songs.length} songs
              </div>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="mb-6 flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, artist, or category..."
                    className="input-light w-full pl-10 pr-4 py-2 rounded-lg"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="relative min-w-[180px]">
                <MdFilterList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5 z-10" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-light w-full pl-10 pr-10 py-2 rounded-lg appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {SONG_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
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

              {/* Visibility Filter */}
              <div className="relative min-w-[150px]">
                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value)}
                  className="input-light w-full px-4 py-2 pr-10 rounded-lg appearance-none cursor-pointer"
                >
                  <option value="all">All Songs</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="text-text-secondary text-center py-8">Loading...</div>
            ) : filteredSongs.length === 0 ? (
              <div className="text-text-secondary text-center py-8">
                {searchQuery || selectedCategory || visibilityFilter !== 'all' 
                  ? 'No songs found matching your filters.'
                  : 'No songs yet. Upload your first track above.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="space-y-3">
                  {filteredSongs.map((song) => {
                    const thumbnailUrl = getThumbnailUrl(song.thumbnail_url);
                    return (
                      <div
                        key={song.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-lg ${
                          song.is_active 
                            ? 'bg-card-bg border-border-light hover:bg-card-hover' 
                            : 'bg-gray-800/50 border-gray-700 opacity-75'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          {thumbnailUrl ? (
                            <img
                              src={thumbnailUrl}
                              alt={song.title}
                              className="w-16 h-16 rounded-full object-cover border-2 border-border-light"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-16 h-16 rounded-full bg-spotify-light-gray border-2 border-border-light items-center justify-center ${thumbnailUrl ? 'hidden' : 'flex'}`}
                          >
                            <MdImage className="w-8 h-8 text-text-secondary" />
                          </div>
                        </div>

                        {/* Song Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-text-primary truncate">
                              {song.title}
                            </h3>
                            {!song.is_active && (
                              <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-text-secondary mt-1">{song.artist}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="px-2 py-1 text-xs bg-spotify-green/20 text-spotify-green rounded-full">
                              {song.category}
                            </span>
                            {song.description && (
                              <p className="text-xs text-text-secondary truncate max-w-xs">
                                {song.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleToggleVisibility(song.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              song.is_active
                                ? 'text-green-400 hover:bg-green-500/20'
                                : 'text-gray-400 hover:bg-gray-500/20'
                            }`}
                            title={song.is_active ? 'Hide from users' : 'Show to users'}
                          >
                            {song.is_active ? (
                              <MdVisibility className="w-5 h-5" />
                            ) : (
                              <MdVisibilityOff className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(song)}
                            className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-green-hover transition-colors text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(song.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {editingSong && (
        <SongEditModal
          song={editingSong}
          onClose={() => setEditingSong(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default SongManagement;
