import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdPlayArrow } from 'react-icons/md';
import AddToPlaylistModal from './AddToPlaylistModal';


const PlaylistCard = ({ playlist, showAddButton = false, onAddSong }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCardClick = () => {
    navigate(`/playlist/${playlist.id}`);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (onAddSong) {
      onAddSong(playlist.id);
    } else {
      setShowAddModal(true);
    }
  };

  return (
    <>
      <div
        className="bg-spotify-light-gray rounded-lg p-4 hover:bg-spotify-gray cursor-pointer transition-colors relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        <div className="aspect-square bg-gradient-to-br from-spotify-green to-spotify-green-dark rounded-lg flex items-center justify-center mb-4 shadow-lg relative">
          <span className="text-5xl">🎵</span>
          {/* {showAddButton && isHovered && (
            <button
              onClick={handleAddClick}
              className="absolute top-2 right-2 w-10 h-10 bg-spotify-green hover:bg-spotify-green-hover rounded-full flex items-center justify-center shadow-lg text-white transition-transform hover:scale-110 z-10"
              title="Add Songs to Playlist"
            >
              <MdAdd className="w-5 h-5" />
            </button>
          )} */}
        </div>
        <h3 className="font-semibold text-white truncate mb-1">{playlist.name}</h3>
        {playlist.description && (
          <p className="text-sm text-text-gray truncate mb-2">{playlist.description}</p>
        )}
        <p className="text-xs text-text-gray">
          {playlist.song_ids?.length || 0} {playlist.song_ids?.length === 1 ? 'song' : 'songs'}
        </p>
      </div>

      {showAddModal && (
        <AddToPlaylistModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          songId={null}
          onSuccess={() => {
            // Optionally reload
          }}
        />
      )}
    </>
  );
};

export default PlaylistCard;