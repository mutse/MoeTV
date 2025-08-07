import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createDb, users, subscriptions } from '@/lib/db';
import { eq, desc, like, or } from 'drizzle-orm';

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

export async function GET(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { db } = authResult;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let usersList;
    if (search) {
      usersList = await db.select().from(users)
        .where(
          or(
            like(users.email, `%${search}%`),
            like(users.username, `%${search}%`)
          )
        )
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      usersList = await db.select().from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const totalUsers = await db.select().from(users);

    return NextResponse.json({
      users: usersList,
      pagination: {
        page,
        limit,
        total: totalUsers.length,
        totalPages: Math.ceil(totalUsers.length / limit)
      }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { db } = authResult;
    const body = await request.json() as {
      email?: string;
      username?: string;
      password?: string;
      isAdmin?: boolean;
    };
    const { email, username, password, isAdmin = false } = body;

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await db.insert(users).values({
      email,
      username,
      password: hashedPassword,
      isAdmin,
    }).returning();

    return NextResponse.json({ user: newUser[0] });
  } catch (error) {
    console.error('Admin create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'edge';
