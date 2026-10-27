import { pgTable, text, integer, boolean, timestamp, date, doublePrecision, jsonb, index } from 'drizzle-orm/pg-core';

export type NotificationPrefs = {
  newLeads: boolean;
  followUps: boolean;
  payments: boolean;
  adminAlerts: boolean;
};

export const users = pgTable('users', {
  id: text().primaryKey(),
  email: text().notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  businessName: text('business_name').notNull(),
  businessType: text('business_type').notNull().default('Small Business'),
  currency: text().$type<'NGN' | 'USD'>().notNull().default('NGN'),
  role: text().$type<'admin' | 'user'>().notNull().default('user'),
  plan: text().$type<'free' | 'pro' | 'business'>().notNull().default('free'),
  planExpiresAt: timestamp('plan_expires_at', { withTimezone: true }),
  aiCreditsUsed: integer('ai_credits_used').notNull().default(0),
  aiCreditsLimit: integer('ai_credits_limit').notNull().default(25),
  notificationPrefs: jsonb('notification_prefs').$type<NotificationPrefs>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  'sessions',
  {
    tokenHash: text('token_hash').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('sessions_user_idx').on(t.userId)]
);

export const content = pgTable(
  'content',
  {
    id: text().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text().notNull().default('ad'),
    title: text().notNull(),
    platform: text(),
    data: jsonb().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('content_user_idx').on(t.userId)]
);

export const leads = pgTable(
  'leads',
  {
    id: text().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    fullName: text('full_name').notNull(),
    email: text().notNull().default(''),
    phone: text().notNull().default(''),
    source: text().notNull().default('WhatsApp'),
    status: text().notNull().default('New'),
    dealValue: doublePrecision('deal_value').notNull().default(0),
    currency: text().notNull().default('NGN'),
    notes: text().notNull().default(''),
    nextFollowUp: date('next_follow_up'),
    followUpNotifiedFor: date('follow_up_notified_for'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('leads_user_idx').on(t.userId), index('leads_follow_up_idx').on(t.nextFollowUp)]
);

export type WebsiteService = { title: string; price: string; description: string; features: string[] };
export type WebsiteTestimonial = { name: string; role: string; quote: string };

export const websites = pgTable(
  'websites',
  {
    id: text().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    slug: text().notNull().unique(),
    businessName: text('business_name').notNull(),
    tagline: text().notNull().default(''),
    description: text().notNull().default(''),
    industry: text().notNull().default(''),
    phone: text().notNull().default(''),
    whatsapp: text().notNull().default(''),
    email: text().notNull().default(''),
    address: text().notNull().default(''),
    themeColor: text('theme_color').notNull().default('#2563EB'),
    heroHeadline: text('hero_headline').notNull().default(''),
    heroSubheadline: text('hero_subheadline').notNull().default(''),
    aboutStory: text('about_story').notNull().default(''),
    services: jsonb().$type<WebsiteService[]>().notNull().default([]),
    testimonials: jsonb().$type<WebsiteTestimonial[]>().notNull().default([]),
    isPublished: boolean('is_published').notNull().default(false),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('websites_user_idx').on(t.userId)]
);

export const transactions = pgTable(
  'transactions',
  {
    id: text().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    userEmail: text('user_email').notNull(),
    reference: text().notNull().unique(),
    provider: text().$type<'Paystack' | 'Flutterwave'>().notNull(),
    plan: text().$type<'pro' | 'business'>().notNull(),
    amount: doublePrecision().notNull(),
    currency: text().$type<'NGN' | 'USD'>().notNull(),
    status: text().$type<'success' | 'failed' | 'pending'>().notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('transactions_user_idx').on(t.userId)]
);

export const systemLogs = pgTable('system_logs', {
  id: text().primaryKey(),
  timestamp: timestamp({ withTimezone: true }).notNull().defaultNow(),
  level: text().$type<'info' | 'warn' | 'error'>().notNull(),
  message: text().notNull(),
  details: jsonb(),
});

// Key/value store for platform config (plans, feature flags) and generated secrets (VAPID keys).
export const appSettings = pgTable('app_settings', {
  key: text().primaryKey(),
  value: jsonb().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const pushSubscriptions = pgTable(
  'push_subscriptions',
  {
    endpoint: text().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    p256dh: text().notNull(),
    auth: text().notNull(),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('push_subscriptions_user_idx').on(t.userId)]
);
