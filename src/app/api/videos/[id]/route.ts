import { NextRequest, NextResponse } from 'next/server';
import { createDb, videos, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    const db = createDb();

    const video = await db.select()
    .from(videos)
    .leftJoin(users, eq(videos.uploaderId, users.id))
    .where(eq(videos.id, videoId))
    .get();

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Increment view count
    await db.update(videos)
      .set({ views: (video.videos.views || 0) + 1 })
      .where(eq(videos.id, videoId));

    return NextResponse.json({ 
      video: {
        ...video.videos,
        uploader: video.users,
        views: (video.videos.views || 0) + 1,
        tags: video.videos.tags ? JSON.parse(video.videos.tags) : [],
      }
    });
  } catch (error) {
    console.error('Get video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
