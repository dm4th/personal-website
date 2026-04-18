import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// ─── users ───────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
});

// ─── sessions (guest + authenticated) ────────────────────────────────────────

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    guestCookieId: text('guest_cookie_id'),
    title: text('title'),
    createdAt: timestamp('created_at').default(sql`now()`).notNull(),
    updatedAt: timestamp('updated_at').default(sql`now()`).notNull(),
  },
  (t) => [
    index('sessions_user_id_idx').on(t.userId),
    index('sessions_guest_cookie_idx').on(t.guestCookieId),
  ],
);

// ─── messages ────────────────────────────────────────────────────────────────

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
    // array of parts: { type: 'text' | 'tool_use' | 'tool_result', ... }
    content: jsonb('content').notNull(),
    createdAt: timestamp('created_at').default(sql`now()`).notNull(),
  },
  (t) => [index('messages_session_id_idx').on(t.sessionId, t.createdAt)],
);

// ─── tool_calls ───────────────────────────────────────────────────────────────

export const toolCalls = pgTable('tool_calls', {
  id: uuid('id').defaultRandom().primaryKey(),
  messageId: uuid('message_id')
    .notNull()
    .references(() => messages.id, { onDelete: 'cascade' }),
  toolName: text('tool_name').notNull(),
  input: jsonb('input'),
  output: jsonb('output'),
  status: text('status', {
    enum: ['pending', 'success', 'error', 'denied_auth'],
  }).notNull(),
  durationMs: integer('duration_ms'),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
});

// ─── drafted_emails ───────────────────────────────────────────────────────────

export const draftedEmails = pgTable('drafted_emails', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'set null' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  subject: text('subject').notNull(),
  bodyMarkdown: text('body_markdown').notNull(),
  bodyPlain: text('body_plain').notNull(),
  status: text('status', { enum: ['draft', 'queued', 'sent', 'failed'] })
    .notNull()
    .default('draft'),
  resendMessageId: text('resend_message_id'),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
  sentAt: timestamp('sent_at'),
});

// ─── meetings ─────────────────────────────────────────────────────────────────

export const meetings = pgTable('meetings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'set null' }),
  purpose: text('purpose').notNull(),
  slotStart: timestamp('slot_start').notNull(),
  slotEnd: timestamp('slot_end').notNull(),
  googleEventId: text('google_event_id'),
  visitorEmail: text('visitor_email'),
  status: text('status', { enum: ['proposed', 'confirmed', 'cancelled'] })
    .notNull()
    .default('proposed'),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
});

// ─── memos (Phase 2, table created now) ──────────────────────────────────────

export const memos = pgTable('memos', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  bodyMarkdown: text('body_markdown').notNull(),
  sourceSessionId: uuid('source_session_id').references(() => sessions.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
});

// ─── google_oauth_tokens ──────────────────────────────────────────────────────

export const googleOAuthTokens = pgTable(
  'google_oauth_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    subjectType: text('subject_type', { enum: ['danny', 'visitor'] }).notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    // stored as encrypted text (app-layer AES-256-GCM using TOKEN_ENC_KEY env var)
    accessToken: text('access_token').notNull(),
    refreshToken: text('refresh_token').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    scopes: text('scopes').array().notNull(),
    createdAt: timestamp('created_at').default(sql`now()`).notNull(),
    updatedAt: timestamp('updated_at').default(sql`now()`).notNull(),
  },
  (t) => [
    uniqueIndex('google_oauth_tokens_subject_user_idx').on(t.subjectType, t.userId),
  ],
);

// ─── relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  draftedEmails: many(draftedEmails),
  meetings: many(meetings),
  memos: many(memos),
  googleOAuthTokens: many(googleOAuthTokens),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
  messages: many(messages),
  draftedEmails: many(draftedEmails),
  meetings: many(meetings),
  memos: many(memos),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  session: one(sessions, { fields: [messages.sessionId], references: [sessions.id] }),
  toolCalls: many(toolCalls),
}));

export const toolCallsRelations = relations(toolCalls, ({ one }) => ({
  message: one(messages, { fields: [toolCalls.messageId], references: [messages.id] }),
}));
