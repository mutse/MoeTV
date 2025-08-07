import { NextRequest, NextResponse } from 'next/server';
import { createDb, videos, users } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { desc, eq, and, like } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const session = await getSession(request);
    const db = createDb();

    const videoList = await db.select()
    .from(videos)
    .leftJoin(users, eq(videos.uploaderId, users.id))
    .where(eq(videos.isPublic, true))
    .orderBy(desc(videos.createdAt))
    .limit(limit)
    .offset(offset);

    return NextResponse.json({ videos: videoList });
  } catch (error) {
    console.error('Get videos error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

interface VideoUploadRequest {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  category?: string;
  tags?: string[];
  isPremium?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as VideoUploadRequest;
    const {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      category,
      tags,
      isPremium = false,
    } = body;

    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: 'Title and video URL are required' },
        { status: 400 }
      );
    }

    const db = createDb();

    const newVideo = await db.insert(videos).values({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      category,
      tags: tags ? JSON.stringify(tags) : null,
      isPremium,
      uploaderId: session.userId,
    }).returning().get();

    return NextResponse.json({
      message: 'Video uploaded successfully',
      video: newVideo,
    });
  } catch (error) {
    console.error('Upload video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Node.js runtime for local development
export const runtime = 'nodejs';
