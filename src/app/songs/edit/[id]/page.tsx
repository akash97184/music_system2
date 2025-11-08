'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Save, MusicNote } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateSong, fetchSongs } from '@/store/slices/songsSlice';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Song } from '@/types';
import { songsApi } from '@/utils/api';

export default function EditSongPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { songs, loading: songsLoading } = useAppSelector((state) => state.songs);
  
  const songId = params.id as string;
  const songFromStore = songs.find((s) => s.id === songId);
  const [currentSong, setCurrentSong] = useState<Song | null>(songFromStore || null);
  
  const [title, setTitle] = useState('');
  const [singer, setSinger] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSong, setLoadingSong] = useState(true);
  const [titleError, setTitleError] = useState('');
  const [singerError, setSingerError] = useState('');
  const [yearError, setYearError] = useState('');

  useEffect(() => {
    // Fetch songs if not loaded and user exists
    if (user && songs.length === 0 && !songsLoading) {
      dispatch(fetchSongs(user.id));
    }
  }, [user, songs.length, songsLoading, dispatch]);

  useEffect(() => {
    // Update currentSong when songFromStore changes
    if (songFromStore && !currentSong) {
      setCurrentSong(songFromStore);
    }
  }, [songFromStore, currentSong]);

  useEffect(() => {
    const loadSong = async () => {
      // If we have a song from store, use it
      if (songFromStore) {
        setCurrentSong(songFromStore);
        setTitle(songFromStore.title);
        setSinger(songFromStore.singer);
        setYear(songFromStore.year);
        setLoadingSong(false);
        return;
      }

      // If songs are loaded but this song is not found, try fetching from API
      if (songs.length > 0 && !songsLoading && user && songId) {
        try {
          const response = await songsApi.fetchSong(songId);
          if (response.data) {
            setCurrentSong(response.data);
            setTitle(response.data.title);
            setSinger(response.data.singer);
            setYear(response.data.year);
            setLoadingSong(false);
          } else {
            setError(response.error || 'Song not found');
            setLoadingSong(false);
          }
        } catch (err) {
          setError('Song not found');
          setLoadingSong(false);
        }
        return;
      }

      // If songs are empty and loaded, try fetching from API
      if (!songsLoading && songs.length === 0 && user && songId) {
        try {
          const response = await songsApi.fetchSong(songId);
          if (response.data) {
            setCurrentSong(response.data);
            setTitle(response.data.title);
            setSinger(response.data.singer);
            setYear(response.data.year);
            setLoadingSong(false);
          } else {
            setError(response.error || 'Song not found');
            setLoadingSong(false);
          }
        } catch (err) {
          setError('Song not found');
          setLoadingSong(false);
        }
      }
    };

    if (user && songId) {
      loadSong();
    }
  }, [songFromStore, songs.length, songsLoading, songId, user]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => 1900 + i).reverse();

  const validateTitle = (title: string) => {
    if (!title.trim()) {
      setTitleError('Song title is required');
      return false;
    }
    if (title.trim().length < 2) {
      setTitleError('Title must be at least 2 characters');
      return false;
    }
    setTitleError('');
    return true;
  };

  const validateSinger = (singer: string) => {
    if (!singer.trim()) {
      setSingerError('Singer name is required');
      return false;
    }
    if (singer.trim().length < 2) {
      setSingerError('Singer name must be at least 2 characters');
      return false;
    }
    setSingerError('');
    return true;
  };

  const validateYear = (year: number) => {
    if (!year || year < 1900 || year > currentYear) {
      setYearError(`Year must be between 1900 and ${currentYear}`);
      return false;
    }
    setYearError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const isTitleValid = validateTitle(title);
    const isSingerValid = validateSinger(singer);
    const isYearValid = validateYear(year);
    
    if (!isTitleValid || !isSingerValid || !isYearValid) {
      return;
    }
    
    if (!user || !currentSong) {
      setError('User or song not found. Please log in again.');
      return;
    }
    
    // Check if user owns this song
    if (currentSong.userId !== user.id) {
      setError('You do not have permission to edit this song.');
      return;
    }
    
    setLoading(true);
    
    try {
      await dispatch(updateSong({
        id: songId,
        title: title.trim(),
        singer: singer.trim(),
        year,
        userId: user.id,
      })).unwrap();
      
      router.push('/songs');
    } catch (err: any) {
      setError(err.message || 'Failed to update song. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingSong) {
    return (
      <ProtectedRoute>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <CircularProgress />
        </Box>
      </ProtectedRoute>
    );
  }

  if (!currentSong && !loadingSong) {
    return (
      <ProtectedRoute>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
            {error || 'Song not found'}
          </Alert>
          <Link href="/songs" style={{ textDecoration: 'none' }}>
            <Button startIcon={<ArrowBack />}>Back to Songs</Button>
          </Link>
        </Container>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 3 }}>
            <Link href="/songs" style={{ textDecoration: 'none' }}>
              <Button
                startIcon={<ArrowBack />}
                sx={{ mb: 2, color: 'text.secondary' }}
              >
                Back to Songs
              </Button>
            </Link>
          </Box>

          <Card sx={{ borderRadius: '20px', overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                p: 4,
                textAlign: 'center',
                color: 'white',
              }}
            >
              <MusicNote sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h4" component="h1" fontWeight="bold">
                Edit Song
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                Update song information
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    label="Song Title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (titleError) validateTitle(e.target.value);
                    }}
                    onBlur={() => validateTitle(title)}
                    error={!!titleError}
                    helperText={titleError}
                    placeholder="Enter song title"
                    autoFocus
                  />

                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                      <TextField
                        fullWidth
                        label="Singer/Artist"
                        value={singer}
                        onChange={(e) => {
                          setSinger(e.target.value);
                          if (singerError) validateSinger(e.target.value);
                        }}
                        onBlur={() => validateSinger(singer)}
                        error={!!singerError}
                        helperText={singerError}
                        placeholder="Enter singer or artist name"
                      />
                    </Box>

                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                      <FormControl fullWidth>
                        <InputLabel>Year</InputLabel>
                        <Select
                          value={year}
                          label="Year"
                          onChange={(e) => {
                            const newYear = Number(e.target.value);
                            setYear(newYear);
                            if (yearError) validateYear(newYear);
                          }}
                          onBlur={() => validateYear(year)}
                          error={!!yearError}
                          sx={{ borderRadius: '10px' }}
                        >
                          {years.map((y) => (
                            <MenuItem key={y} value={y}>
                              {y}
                            </MenuItem>
                          ))}
                        </Select>
                        {yearError && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                            {yearError}
                          </Typography>
                        )}
                      </FormControl>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <Link href="/songs" style={{ textDecoration: 'none', flex: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ borderRadius: '10px', py: 1.5 }}
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    startIcon={<Save />}
                    sx={{
                      borderRadius: '10px',
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      flex: 1,
                    }}
                  >
                    {loading ? 'Updating...' : 'Update Song'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}

