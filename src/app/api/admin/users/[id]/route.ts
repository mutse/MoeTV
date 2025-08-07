import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createDb, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

async function checkAdminAuth(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return { error: 'Not authenticated', status: 401 };
  }

  const db = createDb();
  const user = await db.select()
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  if (!user?.isAdmin) {
    return { error: 'Admin access required', status: 403 };
  }

  return { db, session };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await checkAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { db } = authResult;
    const user = await db.select().from(users).where(eq(users.id, params.id)).get();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Admin get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await checkAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { db } = authResult;
    const body = await request.json() as {
      email?: string;
      username?: string;
      isAdmin?: boolean;
      isSubscribed?: boolean;
      subscriptionType?: string;
      subscriptionExpires?: string;
    };
    const { 
      email, 
      username, 
      isAdmin, 
      isSubscribed, 
      subscriptionType, 
      subscriptionExpires 
    } = body;

    const updateData: any = { updatedAt: new Date() };
    
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
    if (isSubscribed !== undefined) updateData.isSubscribed = isSubscribed;
    if (subscriptionType !== undefined) updateData.subscriptionType = subscriptionType;
    if (subscriptionExpires !== undefined) updateData.subscriptionExpires = new Date(subscriptionExpires);

    const updatedUser = await db.update(users)
      .set(updateData)
      .where(eq(users.id, params.id))
      .returning();

    if (!updatedUser.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser[0] });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await checkAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { db, session } = authResult;

    if (params.id === session.userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const deletedUser = await db.delete(users)
      .where(eq(users.id, params.id))
      .returning();

    if (!deletedUser.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
