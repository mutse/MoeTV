# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MoeTV is a modern video streaming platform built with Next.js 14 and designed for deployment on Cloudflare Pages/Workers. The application features a subscription-based content model with three tiers (Free, Premium, VIP) and comprehensive user management.

## Essential Commands

### Development
```bash
npm run dev                    # Start development server on http://localhost:3000
npm run build                  # Build production application
npm run start                  # Start production server
npm run lint                   # Run ESLint
npm run typecheck              # Run TypeScript type checking
```

### Database Operations
```bash
npm run db:generate            # Generate new Drizzle migrations
npm run db:push                # Apply schema changes to database
npm run db:studio              # Open Drizzle Studio in browser for database management
```

### Admin User Creation
```bash
npx tsx create-admin.ts        # Create initial admin user (requires database setup)
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Authentication**: JWT tokens with secure HTTP-only cookies
- **Deployment**: Designed for Cloudflare Pages/Workers (uses Edge Runtime)

### Database Configuration
The project uses dual database setup:
- **Local Development**: SQLite file (`dev.db` by default, configurable via `DATABASE_URL`)
- **Production**: Cloudflare D1 database
- **Drizzle Config**: Points to `sqlite.db` file for migrations
- **Connection Logic**: Located in `src/lib/db/index.ts` - auto-selects D1 in production, local SQLite in development

### Authentication System
- JWT-based with 24-hour token expiration
- Session cookies are HTTP-only, secure in production
- Middleware in `src/middleware.ts` handles session refresh on all routes
- Password hashing uses bcryptjs with salt rounds of 12
- User roles: regular users and admins (`isAdmin` boolean field)

### Database Schema
Key tables and relationships:
- **users**: Core user data, subscription status, admin privileges
- **videos**: Video metadata, premium content flags, uploader relationships
- **subscriptions**: Payment tracking, plan management, auto-renewal
- **watchHistory**: User viewing progress and completion tracking
- **favorites**: User-favorited content
- **comments**: Hierarchical comment system with likes

### API Structure
All API routes follow REST conventions in `src/app/api/`:
- `auth/` - Authentication endpoints (login, register, logout, user profile)
- `videos/` - Video CRUD operations with access control
- `subscriptions/` - Subscription management
- `admin/` - Admin-only endpoints for user/subscription management

### UI Components
- Base components in `src/components/ui/` (Radix UI + Tailwind)
- Feature components: `Navbar.tsx`, `VideoCard.tsx`, `VideoPlayer.tsx`
- Admin layout component for protected admin pages
- Dark mode support built into Tailwind configuration

## Important Patterns

### Database Connections
When creating database operations:
```typescript
import { createDb } from '@/lib/db';
const db = createDb(); // Auto-handles D1 vs local SQLite
```

### Authentication Checks
API routes should use this pattern:
```typescript
import { getSession } from '@/lib/auth';
const session = await getSession(request);
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Premium Content Access
Check user subscription before serving premium content:
```typescript
const user = await db.select().from(users).where(eq(users.id, session.userId)).get();
if (video.isPremium && !user.isSubscribed) {
  return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
}
```

### TypeScript Path Aliases
Use `@/` prefix for imports from `src/`:
```typescript
import { Button } from '@/components/ui/button';
import { createDb } from '@/lib/db';
```

## Environment Variables
Required for proper operation:
- `JWT_SECRET`: Strong random string for token signing
- `DATABASE_URL`: Database connection string (optional for local dev)
- `NODE_ENV`: Set to 'production' for production builds

## Cloudflare Deployment
- Uses Edge Runtime (configured in `next.config.mjs`)
- D1 database binding configured in `wrangler.toml`
- Image domains must be configured in Next.js config for external thumbnails
- Environment variables set through Cloudflare Pages dashboard

## Subscription System
Three-tier model:
- **Free**: Basic access, no premium content
- **Premium**: $9.99/month, access to premium videos
- **VIP**: $19.99/month, access to all content + additional features

Subscription status is tracked in both `users.isSubscribed` (boolean) and detailed `subscriptions` table for payment history.

## Testing Database Setup
Before running admin creation or testing database operations:
1. Ensure database tables exist: `npm run db:push`
2. Check which database file is being used (drizzle config vs app config)
3. Use `npm run db:studio` to inspect database state

## Development Workflow
1. Make schema changes in `src/lib/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply changes: `npm run db:push`
4. Test changes with `npm run dev`
5. Run type checking: `npm run typecheck`
6. Run linting: `npm run lint`