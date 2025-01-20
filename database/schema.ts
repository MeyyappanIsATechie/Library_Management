import {
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const STATUS_ENUM = pgEnum('status', [
  'PENDING',
  'APPROVED',
  'REJECTED',
]);
export const ROLE_ENUM = pgEnum('role', ['ADMIN', 'USER']);
export const BORROW_STATUS_ENUM = pgEnum('borrow_status', [
  'BORROWED',
  'RETURNED',
]);

export const users = pgTable('users', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: text('email').notNull().unique(),
  universityId: integer('university_id').notNull().unique(),
  universityCard: text('university_card').notNull(),
  password: text('password').notNull(),
  status: STATUS_ENUM('status').default('PENDING'),
  role: ROLE_ENUM('role').default('USER'),
  lastActivityDate: date('last_activity_date').defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const books = pgTable('books', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  author: varchar('author', { length: 255 }).notNull(),
  genre: text('genre').notNull(),
  rating: integer('rating').notNull(),
  publicationYear: integer('publicationYear'),
  totalCopies: integer('total_copies').notNull().default(1),
  availableCopies: integer('available_copies').notNull().default(1),
  description: text('description').notNull(),
  coverColor: varchar('color', { length: 7 }).notNull(),
  coverUrl: text('cover_url').notNull(),
  videoUrl: text('video_url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  summary: varchar('summary').notNull(),
});
