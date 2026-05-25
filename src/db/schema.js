import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * Polls Table
 */
export const polls = pgTable('polls', {
  id: uuid('id').primaryKey().defaultRandom(),

  creatorId: uuid('creator_id')
    .references(() => usersTable.id, {
      onDelete: 'set null',
    }),

  question: text('question').notNull(),

  isClosed: boolean('is_closed')
    .default(false)
    .notNull(), 

  allowMultiple: boolean('allow_multiple')
    .default(false)
    .notNull(),

  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),

  expiresAt: timestamp('expires_at'),

  updatedAt: timestamp('updated_at')
    .$onUpdate(() => new Date()),
});

/**
 * Poll Options Table
 */
export const pollOptions = pgTable('poll_options', {
  id: uuid('id').primaryKey().defaultRandom(),

  pollId: uuid('poll_id')
    .notNull()
    .references(() => polls.id, {
      onDelete: 'cascade',
    }),

  optionText: text('option_text').notNull(),

  voteCount: integer('vote_count')
    .default(0)
    .notNull(),

  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at')
    .$onUpdate(() => new Date()),
});

/**
 * Feedback Table
 */
export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().defaultRandom(),

  pollId: uuid('poll_id')
    .notNull()
    .references(() => polls.id, {
      onDelete: 'cascade',
    }),

  feedbackText: text('feedback_text')
    .notNull(),

  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at')
    .$onUpdate(() => new Date()),
});



export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  fullName: varchar("full_name", { length: 80 }).notNull(),

  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false),

  profileImageUrl: text("profile_image_url"),

  salt: text("salt"),
  password : text("password"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});