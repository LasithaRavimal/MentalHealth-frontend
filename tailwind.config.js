/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Spotify Green
        'spotify-green': '#1DB954',
        'spotify-green-hover': '#1ed760',
        'spotify-green-light': '#1ed760',
        'spotify-green-dark': '#169c46',
        // Dark backgrounds (Spotify style)
        'spotify-black': '#121212',
        'spotify-dark-gray': '#181818',
        'spotify-light-gray': '#282828',
        'spotify-gray': '#404040',
        // Text colors
        'text-white': '#FFFFFF',
        'text-gray': '#B3B3B3',
        'text-gray-dark': '#A7A7A7',
        // Legacy aliases for compatibility
        'primary-green': '#1DB954',
        'primary-green-hover': '#1ed760',
        'primary-green-light': '#1ed760',
        'primary-green-dark': '#169c46',
        'bg-primary': '#121212',
        'bg-secondary': '#181818',
        'bg-tertiary': '#282828',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B3B3B3',
        'text-tertiary': '#A7A7A7',
        'border-light': '#404040',
        'card-bg': '#181818',
        'card-hover': '#282828',
        'sidebar-bg': '#000000',
        'player-bg': '#181818',
        'input-bg': '#2A2A2A',
        'input-border': '#404040',
        'input-focus': '#1DB954',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'pulse-slow': 'pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

