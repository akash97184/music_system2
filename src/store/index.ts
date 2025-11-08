import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import songsReducer from './slices/songsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    songs: songsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

