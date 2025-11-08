import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Song, SongsState, RootState } from '@/types';
import { songsApi } from '@/utils/api';

const initialState: SongsState = {
  songs: [],
  loading: false,
  error: null,
};

// Async thunks using API calls
export const fetchSongs = createAsyncThunk(
  'songs/fetchSongs',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await songsApi.fetchSongs(userId);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.data || [];
    } catch (error) {
      return rejectWithValue('Failed to fetch songs');
    }
  }
);

export const addSong = createAsyncThunk(
  'songs/addSong',
  async (songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>, { getState, rejectWithValue }) => {
    try {
      const response = await songsApi.addSong({
        title: songData.title,
        singer: songData.singer,
        year: songData.year,
        userId: songData.userId,
      });
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      if (!response.data) {
        return rejectWithValue('Failed to add song');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to add song');
    }
  }
);

export const updateSong = createAsyncThunk(
  'songs/updateSong',
  async ({ id, ...songData }: Partial<Song> & { id: string }, { getState, rejectWithValue }) => {
    try {
      if (!songData.userId) {
        return rejectWithValue('User ID is required');
      }
      
      const response = await songsApi.updateSong(id, {
        title: songData.title || '',
        singer: songData.singer || '',
        year: songData.year || new Date().getFullYear(),
        userId: songData.userId,
      });
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      if (!response.data) {
        return rejectWithValue('Failed to update song');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to update song');
    }
  }
);

export const deleteSong = createAsyncThunk(
  'songs/deleteSong',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await songsApi.deleteSong(id);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete song');
    }
  }
);

const songsSlice = createSlice({
  name: 'songs',
  initialState,
  reducers: {
    clearSongs: (state) => {
      state.songs = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSongs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSongs.fulfilled, (state, action) => {
        state.loading = false;
        state.songs = action.payload;
      })
      .addCase(fetchSongs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addSong.fulfilled, (state, action) => {
        state.songs.push(action.payload);
      })
      .addCase(updateSong.fulfilled, (state, action) => {
        const index = state.songs.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.songs[index] = action.payload;
        } else {
          // If song not found in store, add it (might have been added elsewhere)
          state.songs.push(action.payload);
        }
      })
      .addCase(deleteSong.fulfilled, (state, action) => {
        state.songs = state.songs.filter(s => s.id !== action.payload);
      });
  },
});

export const { clearSongs } = songsSlice.actions;
export default songsSlice.reducer;

