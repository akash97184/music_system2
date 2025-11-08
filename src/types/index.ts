export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Song {
  id: string;
  title: string;
  singer: string;
  year: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface SongsState {
  songs: Song[];
  loading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  songs: SongsState;
}

