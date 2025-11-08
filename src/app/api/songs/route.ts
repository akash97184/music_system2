import { NextRequest, NextResponse } from 'next/server';
import { Song } from '@/types';
import { db } from '../../../lib/db';

// Helper to get user ID from token
function getUserIdFromToken(request: NextRequest): string | null {
  // In production, decode JWT token here
  // For demo, we'll extract from a custom header
  const userId = request.headers.get('x-user-id');
  return userId;
}

// GET - Fetch user's songs
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userSongs = db.songs.findByUserId(userId);

    return NextResponse.json(userSongs);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    );
  }
}

// POST - Add new song
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, singer, year } = body;

    // Validation
    if (!title || !singer || !year) {
      return NextResponse.json(
        { error: 'Title, singer, and year are required' },
        { status: 400 }
      );
    }

    if (year < 1900 || year > new Date().getFullYear()) {
      return NextResponse.json(
        { error: 'Invalid year' },
        { status: 400 }
      );
    }

    // Create new song
    const newSong: Song = {
      id: Date.now().toString(),
      title: title.trim(),
      singer: singer.trim(),
      year: Number(year),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.songs.create(newSong);

    return NextResponse.json(newSong, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add song' },
      { status: 500 }
    );
  }
}

