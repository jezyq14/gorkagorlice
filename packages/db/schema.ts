import { UserRoles, UserRole } from '@repo/schema';
import { relations, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import {
    pgTable,
    uuid,
    text,
    varchar,
    integer,
    timestamp,
    date,
    pgEnum,
} from 'drizzle-orm/pg-core';

// --- TABLES ---

export const classes = pgTable('classes', {
    id: uuid('id').defaultRandom().primaryKey(),
    vulcanId: varchar('vulcan_id', { length: 10 }).unique(),
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
    roles: text('roles').$type<UserRole[]>().array().notNull().default([UserRoles.USER]),
    classId: uuid('class_id').references(() => classes.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
    id: text('id').primaryKey(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
});

export const luckyNumbers = pgTable('lucky_numbers', {
    id: uuid('id').defaultRandom().primaryKey(),
    date: date('date', { mode: 'date' }).notNull().unique(),
    numbers: integer('numbers').array().notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const timetableClasses = pgTable('timetable_classes', {
    id: uuid('id').defaultRandom().primaryKey(),
    vulcanId: varchar('vulcan_id', { length: 10 }).unique().notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    friendlyName: varchar('friendly_name', { length: 255 }),
});

export const teachers = pgTable('teachers', {
    id: uuid('id').defaultRandom().primaryKey(),
    vulcanId: varchar('vulcan_id', { length: 10 }).unique(),
    name: varchar('name', { length: 255 }).unique().notNull(),
    friendlyName: varchar('friendly_name', { length: 255 }),
});

export const rooms = pgTable('rooms', {
    id: uuid('id').defaultRandom().primaryKey(),
    vulcanId: varchar('vulcan_id', { length: 10 }).unique(),
    name: varchar('name', { length: 50 }).notNull(),
    friendlyName: varchar('friendly_name', { length: 255 }),
});

export const timetableHours = pgTable('timetable_hours', {
    number: integer('number').primaryKey(),
    timeFrom: varchar('time_from', { length: 5 }).notNull(),
    timeTo: varchar('time_to', { length: 5 }).notNull(),
});

export const scheduleVariantEnum = pgEnum('schedule_variant', [
    'STANDARD',
    'SHORT_30_LONG_BREAK',
    'SHORT_30_NO_BREAK',
    'SHORT_35_LONG_BREAK',
    'SHORT_35_NO_BREAK',
    'OTHER',
]);

export const scheduleOverrides = pgTable('schedule_overrides', {
    id: uuid('id').defaultRandom().primaryKey(),
    date: date('date', { mode: 'date' }).notNull().unique(),
    variant: scheduleVariantEnum('variant').notNull(),
    reason: varchar('reason', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
});

export const timetableLessons = pgTable('timetable_lessons', {
    id: uuid('id').defaultRandom().primaryKey(),

    classId: uuid('class_id')
        .notNull()
        .references(() => timetableClasses.id, { onDelete: 'cascade' }),
    dayOfWeek: integer('day_of_week').notNull(),
    hourNumber: integer('hour_number')
        .notNull()
        .references(() => timetableHours.number, { onDelete: 'cascade' }),

    subject: varchar('subject', { length: 100 }).notNull(),
    groupName: varchar('group_name', { length: 50 }),

    teacherId: uuid('teacher_id').references(() => teachers.id, { onDelete: 'set null' }),
    roomId: uuid('room_id').references(() => rooms.id, { onDelete: 'set null' }),

    teacherNameFallback: varchar('teacher_name_fallback', { length: 100 }),
    roomNameFallback: varchar('room_name_fallback', { length: 50 }),
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

export const classesRelations = relations(classes, ({ many }) => ({
    users: many(users),
    lessons: many(timetableLessons),
}));

export const teachersRelations = relations(teachers, ({ many }) => ({
    lessons: many(timetableLessons),
}));

export const roomsRelations = relations(rooms, ({ many }) => ({
    lessons: many(timetableLessons),
}));

export const timetableLessonsRelations = relations(timetableLessons, ({ one }) => ({
    class: one(classes, { fields: [timetableLessons.classId], references: [classes.id] }),
    teacher: one(teachers, { fields: [timetableLessons.teacherId], references: [teachers.id] }),
    room: one(rooms, { fields: [timetableLessons.roomId], references: [rooms.id] }),
    hour: one(timetableHours, {
        fields: [timetableLessons.hourNumber],
        references: [timetableHours.number],
    }),
}));

// --- TYPES ---

export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessions>;
export type Class = InferSelectModel<typeof classes>;
export type LuckyNumber = InferSelectModel<typeof luckyNumbers>;
export type Teacher = InferSelectModel<typeof teachers>;
export type Room = InferSelectModel<typeof rooms>;
export type ScheduleOverride = InferSelectModel<typeof scheduleOverrides>;
export type TimetableHour = InferSelectModel<typeof timetableHours>;
export type TimetableLesson = InferSelectModel<typeof timetableLessons>;

export type NewUser = InferInsertModel<typeof users>;
export type NewSession = InferInsertModel<typeof sessions>;
export type NewClass = InferInsertModel<typeof classes>;
export type NewLuckyNumber = InferInsertModel<typeof luckyNumbers>;
export type NewTeacher = InferInsertModel<typeof teachers>;
export type NewRoom = InferInsertModel<typeof rooms>;
export type NewScheduleOverride = InferInsertModel<typeof scheduleOverrides>;
export type NewTimetableHour = InferInsertModel<typeof timetableHours>;
export type NewTimetableLesson = InferInsertModel<typeof timetableLessons>;
