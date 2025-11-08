import { User } from '@/types';
import { authApi } from './api';

// Auth utility using API calls
export const registerUser = async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await authApi.register(name, email, password);
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  if (!response.data) {
    throw new Error('Registration failed');
  }

  // Store userId for API calls
  if (typeof window !== 'undefined' && response.data.user) {
    localStorage.setItem('userId', response.data.user.id);
  }
  
  return response.data;
};

export const loginUser = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await authApi.login(email, password);
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  if (!response.data) {
    throw new Error('Login failed');
  }

  // Store userId for API calls
  if (typeof window !== 'undefined' && response.data.user) {
    localStorage.setItem('userId', response.data.user.id);
  }
  
  return response.data;
};

