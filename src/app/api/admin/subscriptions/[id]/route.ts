import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createDb, users, subscriptions } from '@/lib/db';
import { eq } from 'drizzle-orm';

async function checkAdminAuth(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return { error: 'Not authenticated', status: 401 };
  }

  const db = createDb();
  const user = await db.select().from(users).where(eq(users.id, session.userId)).get();

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
    const subscription = await db.select()
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .where(eq(subscriptions.id, params.id))
      .get();

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Format the response to include user data
    const formattedSubscription = {
      id: subscription.subscriptions.id,
      userId: subscription.subscriptions.userId,
      planType: subscription.subscriptions.planType,
      price: subscription.subscriptions.price,
      currency: subscription.subscriptions.currency,
      status: subscription.subscriptions.status,
      startDate: subscription.subscriptions.startDate,
      endDate: subscription.subscriptions.endDate,
      autoRenew: subscription.subscriptions.autoRenew,
      createdAt: subscription.subscriptions.createdAt,
      updatedAt: subscription.subscriptions.updatedAt,
      userEmail: subscription.users?.email,
      username: subscription.users?.username,
    };

    return NextResponse.json({ subscription: formattedSubscription });
  } catch (error) {
    console.error('Admin get subscription error:', error);
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
      planType?: string;
      price?: number;
      currency?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      autoRenew?: boolean;
    };
    const { 
      planType, 
      price, 
      currency,
      status, 
      startDate,
      endDate,
      autoRenew
    } = body;

    const updateData: any = { updatedAt: new Date() };
    
    if (planType !== undefined) updateData.planType = planType;
    if (price !== undefined) updateData.price = price;
    if (currency !== undefined) updateData.currency = currency;
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (autoRenew !== undefined) updateData.autoRenew = autoRenew;

    const updatedSubscription = await db.update(subscriptions)
      .set(updateData)
      .where(eq(subscriptions.id, params.id))
      .returning();

    if (!updatedSubscription.length) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const subscription = updatedSubscription[0];
    
    if (status !== undefined) {
      await db.update(users)
        .set({
          isSubscribed: status === 'active',
          subscriptionType: status === 'active' ? subscription.planType : null,
          subscriptionExpires: status === 'active' ? subscription.endDate : null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, subscription.userId));
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Admin update subscription error:', error);
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

    const { db } = authResult;

    const subscription = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.id, params.id))
      .get();

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    await db.delete(subscriptions).where(eq(subscriptions.id, params.id));

    await db.update(users)
      .set({
        isSubscribed: false,
        subscriptionType: null,
        subscriptionExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, subscription.userId));

    return NextResponse.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Admin delete subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}