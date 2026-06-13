import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
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

// Dictionaries
const dictionaryItemSchema = v.object({
    id: v.string(),
    name: v.string(),
    friendlyName: v.nullable(v.string()),
});

const dictionariesResponseSchema = v.object({
    classes: v.array(dictionaryItemSchema),
    teachers: v.array(dictionaryItemSchema),
    rooms: v.array(dictionaryItemSchema),
});

// Lesson Schema
const lessonSchema = v.object({
    id: v.string(),
    subject: v.string(),
    groupName: v.nullable(v.string()),
    teacherName: v.nullable(v.string()),
    roomName: v.nullable(v.string()),
});

const hourSchema = v.object({
    number: v.number(),
    timeFrom: v.string(),
    timeTo: v.string(),
});

// Day -> Hour -> Lessons
const classTimetableResponseSchema = v.object({
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
                    content: {
                        'application/json': { schema: resolver(dictionariesResponseSchema) },
                    },
                },
                500: { description: 'Internal Server Error' },
            },
        }),
        async (c) => {
            try {
                const [allClasses, allTeachers, allRooms] = await Promise.all([
                    db
                        .select({
                            id: timetableClasses.id,
                            name: timetableClasses.name,
                            friendlyName: timetableClasses.friendlyName,
                        })
                        .from(timetableClasses),
                    db
                        .select({
                            id: teachers.id,
                            name: teachers.name,
                            friendlyName: teachers.friendlyName,
                        })
                        .from(teachers),
                    db
                        .select({
                            id: rooms.id,
                            name: rooms.name,
                            friendlyName: rooms.friendlyName,
                        })
                        .from(rooms),
                ]);

                return c.json({
                    classes: allClasses,
                    teachers: allTeachers,
                    rooms: allRooms,
                });
            } catch (error) {
                logger.error({ error }, 'Error fetching dictionaries');
                return c.json({ error: 'Internal Server Error' }, 500);
            }
        },
    )
    .get(
        '/class/:id',
        describeRoute({
            description: 'Fetches the structured timetable for a specific class',
            responses: {
                200: {
                    description: 'Class timetable',
                    content: {
                        'application/json': { schema: resolver(classTimetableResponseSchema) },
                    },
                },
                404: { description: 'Class not found' },
                500: { description: 'Internal Server Error' },
            },
        }),
        validator('param', v.object({ id: v.pipe(v.string(), v.uuid()) })),
        async (c) => {
            const classId = c.req.valid('param').id;

            try {
                const targetClass = await db.query.timetableClasses.findFirst({
                    where: eq(timetableClasses.id, classId),
                });

                if (!targetClass) return c.json({ error: 'Class not found' }, 404);

                const [allHours, lessonsFlat] = await Promise.all([
                    db.select().from(timetableHours),
                    db.query.timetableLessons.findMany({
                        where: eq(timetableLessons.classId, classId),
                        with: {
                            teacher: true,
                            room: true,
                        },
                    }),
                ]);

                const hoursFormatted: Record<string, any> = {};
                for (const h of allHours) {
                    hoursFormatted[h.number.toString()] = h;
                }

                const daysFormatted: Record<string, any[]>[] = [{}, {}, {}, {}, {}];

                for (const l of lessonsFlat) {
                    const day = l.dayOfWeek;
                    const hour = l.hourNumber.toString();

                    if (!daysFormatted[day]) daysFormatted[day] = {};
                    if (!daysFormatted[day][hour]) daysFormatted[day][hour] = [];

                    const teacherName =
                        l.teacher?.friendlyName || l.teacher?.name || l.teacherNameFallback;
                    const roomName = l.room?.friendlyName || l.room?.name || l.roomNameFallback;

                    const isDuplicate = daysFormatted[day][hour].some(
                        (existing) =>
                            existing.subject === l.subject &&
                            existing.groupName === l.groupName &&
                            existing.teacherName === teacherName &&
                            existing.roomName === roomName,
                    );

                    if (!isDuplicate) {
                        daysFormatted[day][hour].push({
                            id: l.id,
                            subject: l.subject,
                            groupName: l.groupName,
                            teacherName: teacherName,
                            roomName: roomName,
                        });
                    }
                }

                return c.json({
                    hours: hoursFormatted,
                    days: daysFormatted,
                });
            } catch (error) {
                logger.error({ error }, 'Error fetching class timetable');
                return c.json({ error: 'Internal Server Error' }, 500);
            }
        },
    );
