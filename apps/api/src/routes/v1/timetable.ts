import { Hono } from 'hono';
import { eq, or } from 'drizzle-orm';
import * as v from 'valibot';
import { describeRoute, resolver, validator } from 'hono-openapi';

import { db } from '@repo/db';
import {
    timetableClasses,
    teachers,
    rooms,
    timetableLessons,
    timetableHours,
} from '@repo/db/schema';
import { logger } from '../../utils/logger';
import { formatTimetable } from '../../utils/formatTimetable';

const dictionaryItemSchema = v.object({
    name: v.string(),
    friendlyName: v.nullable(v.string()),
    alias: v.string(),
});

const dictionariesResponseSchema = v.object({
    classes: v.array(dictionaryItemSchema),
    teachers: v.array(dictionaryItemSchema),
    rooms: v.array(dictionaryItemSchema),
});

const lessonSchema = v.object({
    id: v.string(),
    subject: v.string(),
    groupName: v.nullable(v.string()),
    className: v.nullable(v.string()),
    classAlias: v.nullable(v.string()),
    teacherName: v.nullable(v.string()),
    teacherAlias: v.nullable(v.string()),
    roomName: v.nullable(v.string()),
    roomAlias: v.nullable(v.string()),
});

const hourSchema = v.object({
    number: v.number(),
    timeFrom: v.string(),
    timeTo: v.string(),
});

// Day -> Hour -> Lessons
const timetableResponseSchema = v.object({
    hours: v.record(v.string(), hourSchema),
    days: v.array(v.record(v.string(), v.array(lessonSchema))),
});

export const timetableRouter = new Hono()
    .get(
        '/dictionaries',
        describeRoute({
            description: 'Fetches dictionaries (lists) of classes, teachers, and rooms',
            responses: {
                200: {
                    description: 'Dictionaries fetched successfully',
                    content: { 'application/json': { schema: resolver(dictionariesResponseSchema) } },
                },
                500: { description: 'Internal Server Error' },
            },
        }),
        async (c) => {
            try {
                const [allClasses, allTeachers, allRooms] = await Promise.all([
                    db.select().from(timetableClasses),
                    db.select().from(teachers),
                    db.select().from(rooms),
                ]);

                // results mapping
                return c.json({
                    classes: allClasses.map((c) => ({
                        name: c.name,
                        friendlyName: c.friendlyName,
                        alias: c.vulcanId,
                    })),
                    teachers: allTeachers.map((t) => ({
                        name: t.name,
                        friendlyName: t.friendlyName,
                        alias: t.vulcanId || t.name, // falback to teacher initials
                    })),
                    rooms: allRooms.map((r) => ({
                        name: r.name,
                        friendlyName: r.friendlyName,
                        alias: r.vulcanId || r.name,
                    })),
                });
            } catch (error) {
                logger.error({ error }, 'Error fetching dictionaries');
                return c.json({ error: 'Internal Server Error' }, 500);
            }
        },
    )
    .get(
        '/class/:alias',
        describeRoute({
            description: 'Fetches the structured timetable for a specific class alias (e.g., o1)',
            responses: {
                200: {
                    description: 'Class timetable',
                    content: { 'application/json': { schema: resolver(timetableResponseSchema) } },
                },
                404: { description: 'Class not found' },
                500: { description: 'Internal Server Error' },
            },
        }),
        validator('param', v.object({ alias: v.string() })),
        async (c) => {
            const alias = c.req.valid('param').alias;

            try {
                const targetClass = await db.query.timetableClasses.findFirst({
                    where: eq(timetableClasses.vulcanId, alias),
                });

                if (!targetClass) return c.json({ error: 'Class not found' }, 404);

                const [allHours, lessonsFlat] = await Promise.all([
                    db.select().from(timetableHours),
                    db.query.timetableLessons.findMany({
                        where: eq(timetableLessons.classId, targetClass.id),
                        with: { class: true, teacher: true, room: true },
                    }),
                ]);

                return c.json(formatTimetable(allHours, lessonsFlat));
            } catch (error) {
                logger.error({ error }, 'Error fetching class timetable');
                return c.json({ error: 'Internal Server Error' }, 500);
            }
        },
    )
    .get(
        '/teacher/:alias',
        describeRoute({
            description: 'Fetches the structured timetable for a teacher (vulcanId or initials)',
            responses: {
                200: {
                    description: 'Teacher timetable',
                    content: { 'application/json': { schema: resolver(timetableResponseSchema) } },
                },
                404: { description: 'Teacher not found' },
                500: { description: 'Internal Server Error' },
            },
        }),
        validator('param', v.object({ alias: v.string() })),
        async (c) => {
            const alias = c.req.valid('param').alias;

            try {
                // search by vulcanId or initials
                const targetTeacher = await db.query.teachers.findFirst({
                    where: or(eq(teachers.vulcanId, alias), eq(teachers.name, alias)),
                });

                if (!targetTeacher) return c.json({ error: 'Teacher not found' }, 404);

                const [allHours, lessonsFlat] = await Promise.all([
                    db.select().from(timetableHours),
                    db.query.timetableLessons.findMany({
                        where: eq(timetableLessons.teacherId, targetTeacher.id),
                        with: { class: true, teacher: true, room: true },
                    }),
                ]);

                return c.json(formatTimetable(allHours, lessonsFlat));
            } catch (error) {
                logger.error({ error }, 'Error fetching teacher timetable');
                return c.json({ error: 'Internal Server Error' }, 500);
            }
        },
    )
    .get(
        '/room/:alias',
        describeRoute({
            description: 'Fetches the structured timetable for a specific room',
            responses: {
                200: {
                    description: 'Room timetable',
                    content: { 'application/json': { schema: resolver(timetableResponseSchema) } },
                },
                404: { description: 'Room not found' },
                500: { description: 'Internal Server Error' },
            },
        }),
        validator('param', v.object({ alias: v.string() })),
        async (c) => {
            const alias = c.req.valid('param').alias;

            try {
                const targetRoom = await db.query.rooms.findFirst({
                    where: or(eq(rooms.vulcanId, alias), eq(rooms.name, alias)),
                });

                if (!targetRoom) return c.json({ error: 'Room not found' }, 404);

                const [allHours, lessonsFlat] = await Promise.all([
                    db.select().from(timetableHours),
                    db.query.timetableLessons.findMany({
                        where: eq(timetableLessons.roomId, targetRoom.id),
                        with: { class: true, teacher: true, room: true },
                    }),
                ]);

                return c.json(formatTimetable(allHours, lessonsFlat));
            } catch (error) {
                logger.error({ error }, 'Error fetching room timetable');
                return c.json({ error: 'Internal Server Error' }, 500);
            }
        },
    );