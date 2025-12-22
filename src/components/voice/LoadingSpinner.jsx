import React from 'react';

const LoadingSpinner = ({ message = "Processing audio..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-spotify-light-gray rounded-lg">
      <div className="relative w-16 h-16 mb-4">
        {/* Outer spinning circle */}
        <div className="absolute inset-0 border-4 border-spotify-gray rounded-full"></div>
        <div className="absolute inset-0 border-4 border-spotify-green rounded-full border-t-transparent animate-spin"></div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-2 bg-spotify-green rounded-full animate-pulse-slow opacity-30"></div>
      </div>
      
      <p className="text-text-gray text-sm font-medium animate-pulse">{message}</p>
      
      {/* Audio wave animation */}
      <div className="flex items-center justify-center gap-1 mt-4 h-8">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-spotify-green rounded-full animate-pulse"
            style={{
              height: '100%',
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;