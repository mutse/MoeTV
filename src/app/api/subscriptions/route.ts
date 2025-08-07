import { NextRequest, NextResponse } from 'next/server';
import { createDb, users, subscriptions } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

const SUBSCRIPTION_PLANS = {
  premium: {
    name: 'Premium',
    price: 9.99,
    duration: 30 * 24 * 60 * 60 * 1000, // 30 days
    features: ['HD streaming', 'Ad-free', 'Mobile download'],
  },
  vip: {
    name: 'VIP',
    price: 19.99,
    duration: 30 * 24 * 60 * 60 * 1000, // 30 days
    features: ['4K streaming', 'Ad-free', 'Mobile download', 'Exclusive content'],
  },
};

interface SubscriptionRequest {
  planType: 'premium' | 'vip';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as SubscriptionRequest;
    const { planType } = body;

    if (!planType || !SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS]) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    const db = createDb();
    const plan = SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS];
    
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + plan.duration);

    // Create subscription record
    await db.insert(subscriptions).values({
      userId: session.userId,
      planType,
      price: plan.price,
      currency: 'USD',
      status: 'active',
      startDate,
      endDate,
      autoRenew: true,
    });

    // Update user subscription status
    await db.update(users)
      .set({
        isSubscribed: true,
        subscriptionType: planType,
        subscriptionExpires: endDate,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.userId));

    return NextResponse.json({
      message: 'Subscription created successfully',
      subscription: {
        planType,
        price: plan.price,
        startDate,
        endDate,
        features: plan.features,
      },
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = createDb();
    
    const userSubscriptions = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.userId))
      .orderBy(subscriptions.createdAt);

    return NextResponse.json({ subscriptions: userSubscriptions });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}