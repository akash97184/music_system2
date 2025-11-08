'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PlayArrow,
  Search,
  Logout,
  MusicNote,
  FilterList,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { fetchSongs, deleteSong } from '@/store/slices/songsSlice';
import { Song } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SongsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { songs, loading } = useAppSelector((state) => state.songs);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [singerFilter, setSingerFilter] = useState('');
  const [alphabetFilter, setAlphabetFilter] = useState('');
  const [yearRange, setYearRange] = useState<[number, number]>([1900, new Date().getFullYear()]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [playingSong, setPlayingSong] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchSongs(user.id));
    }
  }, [user, dispatch]);

  // Get unique singers for filter
  const uniqueSingers = useMemo(() => {
    const singers = songs.map(song => song.singer).filter(Boolean);
    return Array.from(new Set(singers)).sort();
  }, [songs]);

  // Filter songs
  const filteredSongs = useMemo(() => {
    let filtered = [...songs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        song =>
          song.title.toLowerCase().includes(query) ||
          song.singer.toLowerCase().includes(query)
      );
    }

    // Singer filter
    if (singerFilter) {
      filtered = filtered.filter(song => song.singer === singerFilter);
    }

    // Alphabet filter
    if (alphabetFilter) {
      filtered = filtered.filter(song =>
        song.title.charAt(0).toUpperCase() === alphabetFilter
      );
    }

    // Year range filter
    filtered = filtered.filter(
      song => {
        const songYear = Number(song.year);
        return songYear >= Number(yearRange[0]) && songYear <= Number(yearRange[1]);
      }
    );

    return filtered.sort((a, b) => a.title.localeCompare(b.title));
  }, [songs, searchQuery, singerFilter, alphabetFilter, yearRange]);

  const handleDelete = (song: Song) => {
    setSongToDelete(song);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (songToDelete) {
      dispatch(deleteSong(songToDelete.id));
      setDeleteDialogOpen(false);
      setSongToDelete(null);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const handlePlay = (songId: string) => {
    if (playingSong === songId) {
      setPlayingSong(null);
    } else {
      setPlayingSong(songId);
    }
  };

  const currentYear = new Date().getFullYear();
  const defaultYearRange: [number, number] = [1900, currentYear];
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => 1900 + i);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const isYearRangeChanged = yearRange[0] !== defaultYearRange[0] || yearRange[1] !== defaultYearRange[1];

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh', pb: 4 }}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            color: 'white',
            py: 4,
            mb: 4,
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MusicNote sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="h1" fontWeight="bold">
                    My Music Collection
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    Welcome back, {user?.name}!
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                onClick={handleLogout}
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
                startIcon={<Logout />}
              >
                Logout
              </Button>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg">
          {/* Actions and Filters */}
          <Card sx={{ mb: 4, borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="600">
                  Songs ({filteredSongs.length})
                </Typography>
                <Link href="/songs/add" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    sx={{ borderRadius: '10px', px: 3 }}
                  >
                    Add New Song
                  </Button>
                </Link>
              </Box>

              {/* Search Bar */}
              <TextField
                fullWidth
                placeholder="Search songs by title or singer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />

              {/* Filters */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <FilterList sx={{ color: 'text.secondary' }} />
                
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Singer</InputLabel>
                  <Select
                    value={singerFilter}
                    label="Singer"
                    onChange={(e) => setSingerFilter(e.target.value)}
                    sx={{ borderRadius: '10px' }}
                  >
                    <MenuItem value="">All Singers</MenuItem>
                    {uniqueSingers.map((singer) => (
                      <MenuItem key={singer} value={singer}>
                        {singer}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Alphabet</InputLabel>
                  <Select
                    value={alphabetFilter}
                    label="Alphabet"
                    onChange={(e) => setAlphabetFilter(e.target.value)}
                    sx={{ borderRadius: '10px' }}
                  >
                    <MenuItem value="">All Letters</MenuItem>
                    {alphabet.map((letter) => (
                      <MenuItem key={letter} value={letter}>
                        {letter}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Year From</InputLabel>
                  <Select
                    value={yearRange[0]}
                    label="Year From"
                    onChange={(e) => {
                      const newFrom = Number(e.target.value);
                      // Ensure "From" doesn't exceed "To"
                      const newTo = newFrom > yearRange[1] ? newFrom : yearRange[1];
                      setYearRange([newFrom, newTo]);
                    }}
                    sx={{ borderRadius: '10px' }}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Year To</InputLabel>
                  <Select
                    value={yearRange[1]}
                    label="Year To"
                    onChange={(e) => {
                      const newTo = Number(e.target.value);
                      // Ensure "To" is not less than "From"
                      const newFrom = newTo < yearRange[0] ? newTo : yearRange[0];
                      setYearRange([newFrom, newTo]);
                    }}
                    sx={{ borderRadius: '10px' }}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {(singerFilter || alphabetFilter || searchQuery || isYearRangeChanged) && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSingerFilter('');
                      setAlphabetFilter('');
                      setSearchQuery('');
                      setYearRange(defaultYearRange);
                    }}
                    sx={{ borderRadius: '10px' }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Songs List */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <Typography>Loading songs...</Typography>
            </Box>
          ) : filteredSongs.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 8, borderRadius: '16px' }}>
              <MusicNote sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {songs.length === 0 ? 'No songs yet' : 'No songs match your filters'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {songs.length === 0
                  ? 'Start building your music collection by adding your first song!'
                  : 'Try adjusting your search or filters'}
              </Typography>
              {songs.length === 0 && (
                <Link href="/songs/add" style={{ textDecoration: 'none' }}>
                  <Button variant="contained" startIcon={<Add />}>
                    Add Your First Song
                  </Button>
                </Link>
              )}
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {filteredSongs.map((song) => (
                <Box key={song.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' } }}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                    className="fade-in"
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Chip
                          label={song.year}
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                        {playingSong === song.id && (
                          <Chip
                            label="Playing"
                            size="small"
                            color="success"
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                      </Box>
                      
                      <Typography variant="h6" component="h3" fontWeight="600" gutterBottom>
                        {song.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        by {song.singer}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 2 }}>
                        <Tooltip title="Play">
                          <IconButton
                            onClick={() => handlePlay(song.id)}
                            sx={{
                              background: playingSong === song.id
                                ? 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)'
                                : 'rgba(99, 102, 241, 0.1)',
                              color: playingSong === song.id ? 'white' : '#6366f1',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                                color: 'white',
                              },
                            }}
                          >
                            <PlayArrow />
                          </IconButton>
                        </Tooltip>
                        
                        <Link href={`/songs/edit/${song.id}`} style={{ textDecoration: 'none' }}>
                          <Tooltip title="Edit">
                            <IconButton
                              sx={{
                                background: 'rgba(236, 72, 153, 0.1)',
                                color: '#ec4899',
                                '&:hover': {
                                  background: '#ec4899',
                                  color: 'white',
                                },
                              }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </Link>
                        
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDelete(song)}
                            sx={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              '&:hover': {
                                background: '#ef4444',
                                color: 'white',
                              },
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Container>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: { borderRadius: '16px' },
          }}
        >
          <DialogTitle>Delete Song</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete &quot;{songToDelete?.title}&quot; by {songToDelete?.singer}?
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={confirmDelete}
              variant="contained"
              color="error"
              sx={{ borderRadius: '10px' }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ProtectedRoute>
  );
}

