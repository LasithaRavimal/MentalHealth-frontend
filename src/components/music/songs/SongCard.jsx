import { useState, useEffect } from 'react';
import { MdAdd, MdPlayArrow, MdPause, MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import AddToPlaylistModal from '../playlist/AddToPlaylistModal';
import apiClient from '../../../api/apiClient';
import { usePlayer } from '../../admin/music/context/PlayerContext';

const SongCard = ({ song, onPlay, showAddButton = true }) => {
  const { currentSong, isPlaying, handlePlayPause } = usePlayer();
  const [isHovered, setIsHovered] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  
  // Check if this song is currently playing
  const isCurrentlyPlaying = currentSong?.id === song.id && isPlaying;

  // Load favorite status on mount
  useEffect(() => {
    loadFavoriteStatus();
  }, [song.id]);

  const loadFavoriteStatus = async () => {
    try {
      const response = await apiClient.get('/songs/favorites');
      const favoriteIds = response.data.song_ids || [];
      setIsFavorite(favoriteIds.includes(song.id));
    } catch (error) {
      console.error('Failed to load favorite status:', error);
    }
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      await apiClient.post(`/songs/${song.id}/favorite`);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const handlePlay = (e) => {
    e?.stopPropagation();
    
    // If this is the currently playing song, toggle play/pause
    if (isCurrentlyPlaying && handlePlayPause) {
      handlePlayPause();
    } else if (onPlay) {
      // Otherwise, play this song
      onPlay(song);
    }
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    setShowAddModal(true);
  };

  return (
    <div
      className="bg-spotify-light-gray rounded-lg p-4 hover:bg-spotify-gray cursor-pointer group transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
    >
      <div className="relative mb-4">
        {song.thumbnail_url ? (
          <img
            src={song.thumbnail_url}
            alt={song.title}
            className="w-full aspect-square object-cover rounded-lg shadow-lg"
          />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-spotify-green to-spotify-green-dark rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-4xl">🎵</span>
          </div>
        )}
        
        {/* Buttons overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center gap-2 bg-spotify-black/60 rounded-lg transition-all ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={handlePlay}
            className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            {isCurrentlyPlaying ? (
              <MdPause className="w-6 h-6 text-spotify-black" />
            ) : (
              <MdPlayArrow className="w-6 h-6 text-spotify-black ml-1" />
            )}
          </button>
          {showAddButton && (
            <button
              onClick={handleAddClick}
              className="w-12 h-12 bg-spotify-light-gray hover:bg-spotify-gray rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-white"
              title="Add to Playlist"
            >
              <MdAdd className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-[3rem]">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{song.title}</h3>
            <p className="text-sm text-text-gray truncate">{song.artist}</p>
          </div>
          <button
            onClick={handleToggleFavorite}
            disabled={isToggling}
            className="flex-shrink-0 text-text-gray hover:text-spotify-green transition-colors p-1 disabled:opacity-50"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? (
              <MdFavorite className="w-5 h-5 text-spotify-green" />
            ) : (
              <MdFavoriteBorder className="w-5 h-5" />
            )}
          </button>
        </div>
        {song.category && (
          <span className="inline-block mt-2 px-2 py-1 text-xs bg-spotify-gray text-text-gray rounded">
            {song.category}
          </span>
        )}
      </div>

      {showAddModal && (
        <AddToPlaylistModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          songId={song.id}
          onSuccess={() => {
            // Optionally reload playlists or update UI
          }}
        />
      )}
    </div>
  );
};

export default SongCard;

