import React from 'react';

const ConfirmationDialog = ({ isOpen, onConfirm, onCancel, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 animate-fade-in">
      <div className="bg-spotify-dark-gray rounded-lg p-6 max-w-md w-full mx-4 shadow-elevated transform transition-all">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-text-white mb-2">{title}</h3>
          <p className="text-text-gray text-sm">{message}</p>
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-full font-bold bg-spotify-gray hover:bg-spotify-light-gray text-text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-full font-bold bg-spotify-green hover:bg-spotify-green-hover text-black transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;