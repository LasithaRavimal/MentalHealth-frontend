import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './PlayerLayout';
import SongCard from './songs/SongCard';
import PlaylistList from './playlist/PlaylistList';
import apiClient from '../../api/apiClient';
import { usePlayer } from '../admin/music/context/PlayerContext';

const MusicPlayerHomeContent = () => {
  const navigate = useNavigate();
  const { onPlaySong } = usePlayer();

  const [songs, setSongs] = useState([]);
  const [featuredSongs, setFeaturedSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      const response = await apiClient.get('/songs');
      const allSongs = response.data || [];

      setSongs(allSongs);
      setFeaturedSongs(allSongs.slice(0, 6));
    } catch (error) {
      console.error('Failed to load songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(songs.map(song => song.category))];

  const handleSongPlay = (song) => {
    onPlaySong(song); // ✅ Session starts INSIDE PlayerContext
  };