// API utility functions

const API_BASE_URL = '/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Helper to make API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (userId) {
      headers['x-user-id'] = userId;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || 'Request failed',
      };
    }

    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Auth API calls
export const authApi = {
  register: async (name: string, email: string, password: string) => {
    return apiCall<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email: string, password: string) => {
    return apiCall<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

// Songs API calls
export const songsApi = {
  fetchSongs: async (userId: string) => {
    // Store userId in localStorage for API calls
    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', userId);
    }
    return apiCall<any[]>('/songs', {
      method: 'GET',
    });
  },

  fetchSong: async (id: string) => {
    return apiCall<any>(`/songs/${id}`, {
      method: 'GET',
    });
  },

  addSong: async (songData: { title: string; singer: string; year: number; userId: string }) => {
    return apiCall<any>('/songs', {
      method: 'POST',
      body: JSON.stringify(songData),
    });
  },

  updateSong: async (id: string, songData: { title: string; singer: string; year: number; userId: string }) => {
    return apiCall<any>(`/songs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(songData),
    });
  },

  deleteSong: async (id: string) => {
    return apiCall<{ message: string }>(`/songs/${id}`, {
      method: 'DELETE',
    });
  },
};

