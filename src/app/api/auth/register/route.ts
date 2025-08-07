import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createDb, users } from '@/lib/db';
import { encrypt } from '@/lib/auth';
import { eq } from 'drizzle-orm';

interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RegisterRequest;
    const { email, password, username } = body;

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get D1 database from platform or use local development database
    const d1Database = (globalThis as any).D1DATABASE;
    const db = createDb(d1Database);

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db.insert(users).values({
      email,
      password: hashedPassword,
      username,
      isSubscribed: false,
      subscriptionType: 'free',
    }).returning().get();

    // Create session
    const token = await encrypt({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
    });

    const response = NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          isSubscribed: newUser.isSubscribed,
        },
      },
      { status: 201 }
    );

    response.cookies.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
