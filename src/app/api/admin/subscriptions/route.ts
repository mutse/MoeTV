import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createDb, users, subscriptions } from '@/lib/db';
import { eq, desc, sql } from 'drizzle-orm';

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
    const status = searchParams.get('status');
    const planType = searchParams.get('planType');
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(subscriptions.status, status));
    }
    if (planType) {
      conditions.push(eq(subscriptions.planType, planType));
    }

    let subscriptionsList;
    if (conditions.length > 0) {
      subscriptionsList = await db.select()
        .from(subscriptions)
        .leftJoin(users, eq(subscriptions.userId, users.id))
        .where(conditions.length === 1 ? conditions[0] : sql`${conditions.join(' AND ')}`)
        .orderBy(desc(subscriptions.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      subscriptionsList = await db.select()
        .from(subscriptions)
        .leftJoin(users, eq(subscriptions.userId, users.id))
        .orderBy(desc(subscriptions.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const totalCount = await db.select().from(subscriptions);

    return NextResponse.json({
      subscriptions: subscriptionsList,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / limit)
      }
    });
  } catch (error) {
    console.error('Admin get subscriptions error:', error);
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
      userId: string;
      planType: string;
      price: number;
      currency?: string;
      status?: string;
      startDate: string;
      endDate: string;
      autoRenew?: boolean;
    };
    const { 
      userId, 
      planType, 
      price, 
      currency = 'USD', 
      status = 'active',
      startDate,
      endDate,
      autoRenew = true
    } = body;

    if (!userId || !planType || !price || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newSubscription = await db.insert(subscriptions).values({
      userId,
      planType,
      price,
      currency,
      status,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      autoRenew,
    }).returning();

    if (status === 'active') {
      await db.update(users)
        .set({
          isSubscribed: true,
          subscriptionType: planType,
          subscriptionExpires: new Date(endDate),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    return NextResponse.json({ subscription: newSubscription[0] });
  } catch (error) {
    console.error('Admin create subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'edge';
