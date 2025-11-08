// Shared in-memory database for demo purposes
// In production, replace with a real database

import { User, Song } from '@/types';

// In-memory storage
let users: User[] = [];
let songs: Song[] = [];

export const db = {
  users: {
    findAll: () => users,
    findById: (id: string) => users.find((u) => u.id === id),
    findByEmail: (email: string) => users.find((u) => u.email === email.toLowerCase()),
    create: (user: User) => {
      users.push(user);
      return user;
    },
  },
  songs: {
    findAll: () => songs,
    findByUserId: (userId: string) => songs.filter((s) => s.userId === userId),
    findById: (id: string) => songs.find((s) => s.id === id),
    create: (song: Song) => {
      songs.push(song);
      return song;
    },
    update: (id: string, updates: Partial<Song>) => {
      const index = songs.findIndex((s) => s.id === id);
      if (index === -1) return null;
      songs[index] = { ...songs[index], ...updates };
      return songs[index];
    },
    delete: (id: string) => {
      const index = songs.findIndex((s) => s.id === id);
      if (index === -1) return false;
      songs.splice(index, 1);
      return true;
    },
  },
};

