import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { createId } from '../utils/id';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  username: text('username').notNull().unique(),
  avatar: text('avatar'),
  isAdmin: integer('is_admin', { mode: 'boolean' }).default(false),
  isSubscribed: integer('is_subscribed', { mode: 'boolean' }).default(false),
  subscriptionType: text('subscription_type'), // 'free', 'premium', 'vip'
  subscriptionExpires: integer('subscription_expires', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const videos = sqliteTable('videos', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  description: text('description'),
  videoUrl: text('video_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  duration: integer('duration'), // in seconds
  views: integer('views').default(0),
  likes: integer('likes').default(0),
  category: text('category'),
  tags: text('tags'), // JSON string of tags
  isPublic: integer('is_public', { mode: 'boolean' }).default(true),
  isPremium: integer('is_premium', { mode: 'boolean' }).default(false),
  uploaderId: text('uploader_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  planType: text('plan_type').notNull(), // 'premium', 'vip'
  price: real('price').notNull(),
  currency: text('currency').default('USD'),
  status: text('status').notNull(), // 'active', 'cancelled', 'expired'
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  autoRenew: integer('auto_renew', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const watchHistory = sqliteTable('watch_history', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  videoId: text('video_id').notNull().references(() => videos.id),
  watchTime: integer('watch_time').default(0), // seconds watched
  completed: integer('completed', { mode: 'boolean' }).default(false),
  lastWatchedAt: integer('last_watched_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const favorites = sqliteTable('favorites', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  videoId: text('video_id').notNull().references(() => videos.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  videoId: text('video_id').notNull().references(() => videos.id),
  userId: text('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  parentId: text('parent_id'), // for replies
  likes: integer('likes').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type WatchHistory = typeof watchHistory.$inferSelect;
export type NewWatchHistory = typeof watchHistory.$inferInsert;