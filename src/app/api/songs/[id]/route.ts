import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

// Helper to get user ID from token
function getUserIdFromToken(request: NextRequest): string | null {
  const userId = request.headers.get('x-user-id');
  return userId;
}

// ========================
// GET - Get single song
// ========================
export async function GET(request: NextRequest, { params }: any) {
  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const songId = resolvedParams.id;
    
    if (!songId) {
      console.error('Song ID not found in params:', resolvedParams);
      return NextResponse.json({ error: 'Song ID is required' }, { status: 400 });
    }

    console.log('GET /songs/[id] - Looking for song ID:', songId, 'User ID:', userId);
    const song = db.songs.findById(songId);

    if (!song) {
      const allSongs = db.songs.findAll();
      console.log('Song not found. ID:', songId, 'Total songs:', allSongs.length, 'Song IDs:', allSongs.map(s => s.id));
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    console.log('Song found:', song.id, 'Owner:', song.userId, 'Requested by:', userId);

    if (song.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to view this song' },
        { status: 403 }
      );
    }

    return NextResponse.json(song);
  } catch (error) {
    console.error('GET /songs/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch song' }, { status: 500 });
  }
}

// ========================
// PUT - Update song
// ========================
export async function PUT(request: NextRequest, { params }: any) {
  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const songId = resolvedParams.id;
    
    if (!songId) {
      console.error('Song ID not found in params:', resolvedParams);
      return NextResponse.json({ error: 'Song ID is required' }, { status: 400 });
    }

    console.log('PUT /songs/[id] - Looking for song ID:', songId, 'User ID:', userId);
    const song = db.songs.findById(songId);

    if (!song) {
      const allSongs = db.songs.findAll();
      console.log('Song not found for update. ID:', songId, 'Total songs:', allSongs.length, 'Song IDs:', allSongs.map(s => s.id));
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    console.log('Song found for update:', song.id, 'Owner:', song.userId, 'Requested by:', userId);

    if (song.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this song' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, singer, year } = body;

    if (!title || !singer || !year) {
      return NextResponse.json(
        { error: 'Title, singer, and year are required' },
        { status: 400 }
      );
    }

    if (year < 1900 || year > new Date().getFullYear()) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
    }

    const updatedSong = db.songs.update(songId, {
      title: title.trim(),
      singer: singer.trim(),
      year: Number(year),
      updatedAt: new Date().toISOString(),
    });

    if (!updatedSong) {
      return NextResponse.json({ error: 'Failed to update song' }, { status: 500 });
    }

    return NextResponse.json(updatedSong);
  } catch (error) {
    console.error('PUT /songs/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update song' }, { status: 500 });
  }
}

// ========================
// DELETE - Delete song
// ========================
export async function DELETE(request: NextRequest, { params }: any) {
  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const songId = resolvedParams.id;
    
    if (!songId) {
      console.error('Song ID not found in params:', resolvedParams);
      return NextResponse.json({ error: 'Song ID is required' }, { status: 400 });
    }

    console.log('DELETE /songs/[id] - Looking for song ID:', songId, 'User ID:', userId);
    const song = db.songs.findById(songId);

    if (!song) {
      const allSongs = db.songs.findAll();
      console.log('Song not found for delete. ID:', songId, 'Total songs:', allSongs.length, 'Song IDs:', allSongs.map(s => s.id));
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    console.log('Song found for delete:', song.id, 'Owner:', song.userId, 'Requested by:', userId);

    if (song.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this song' },
        { status: 403 }
      );
    }

    const deleted = db.songs.delete(songId);

    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('DELETE /songs/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 });
  }
}
