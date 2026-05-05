import { relations, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { pgTable, uuid, text, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

// --- TABLES ---

export const classes = pgTable('classes', {
    id: uuid('id').defaultRandom().primaryKey(),
    number: integer('year').notNull(),
    symbol: varchar('symbol', { length: 10 }).notNull(),
    studentCount: integer('student_count').notNull(),

    president: varchar('president', { length: 255 }),
    vicePresidents: text('vice_presidents').array().notNull().default([]),
    treasurers: text('treasurers').array().notNull().default([]),
});

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    googleId: varchar('google_id', { length: 255 }).unique().notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    avatar: text('avatar'),
    diaryNumber: integer('diary_number'),
    roles: text('roles').array().notNull().default(['student']),
    classId: uuid('class_id').references(() => classes.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
    id: text('id').primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
});

// --- RELATIONS ---

export const usersRelations = relations(users, ({ many, one }) => ({
    sessions: many(sessions),
    class: one(classes, {
        fields: [users.classId],
        references: [classes.id],
    }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));

// --- TYPES ---

export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessions>;
export type Class = InferSelectModel<typeof classes>;

export type NewUser = InferInsertModel<typeof users>;
export type NewSession = InferInsertModel<typeof sessions>;
export type NewClass = InferInsertModel<typeof classes>;