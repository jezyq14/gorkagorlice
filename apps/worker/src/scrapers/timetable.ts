import { Timetable, TimetableList, Table } from '@majusss/timetable-parser';
import { eq } from 'drizzle-orm';

import { db } from '@repo/db';
import {
    timetableClasses,
    teachers,
    rooms,
    timetableHours,
    timetableLessons,
} from '@repo/db/schema';
import { logger } from '../utils/logger';

const TIMETABLE_BASE_URL =
    process.env.TIMETABLE_WEBSITE || 'https://planlekcji.lukasiewicz.gorlice.pl';

export async function fetchAndSyncTimetable() {
    logger.info('Starting full timetable synchronization...');

    try {
        const indexHtml = await fetch(TIMETABLE_BASE_URL).then((res) => res.text());
        const timetable = new Timetable(indexHtml);

        let listPath = timetable.getListPath();
        if (!listPath) listPath = 'lista.html';

        const listHtml = await fetch(`${TIMETABLE_BASE_URL}/${listPath}`).then((res) => res.text());
        const timetableList = new TimetableList(listHtml);
        const listData = timetableList.getList();

        logger.info(
            `Found: ${listData.classes.length} classes, ${listData.teachers?.length || 0} teachers, ${listData.rooms?.length || 0} rooms.`,
        );

        const classMap = new Map<string, string>();

        for (const cls of listData.classes) {
            const vulcanId = `o${cls.value}`;

            const [inserted] = await db
                .insert(timetableClasses)
                .values({ vulcanId, name: cls.name })
                .onConflictDoUpdate({ target: timetableClasses.vulcanId, set: { name: cls.name } })
                .returning({ id: timetableClasses.id });

            classMap.set(vulcanId, inserted.id);
        }

        const roomMap = new Map<string, string>();
        const teacherMap = new Map<string, string>();

        if (listData.rooms) {
            for (const r of listData.rooms) {
                const vulcanId = `s${r.value}`;
                const [inserted] = await db
                    .insert(rooms)
                    .values({ vulcanId, name: r.name })
                    .onConflictDoUpdate({ target: rooms.vulcanId, set: { name: r.name } })
                    .returning({ id: rooms.id });

                roomMap.set(vulcanId, inserted.id);
                roomMap.set(r.name, inserted.id);
            }
        }

        const dbTeachers = await db.select().from(teachers);
        for (const t of dbTeachers) {
            teacherMap.set(t.name, t.id);
        }

        for (const cls of listData.classes) {
            const vulcanId = `o${cls.value}`;
            const dbClassId = classMap.get(vulcanId);
            if (!dbClassId) continue;

            logger.info(`Scraping timetable for class: ${cls.name} (${vulcanId})`);

            const planUrl = `${TIMETABLE_BASE_URL}/plany/${vulcanId}.html`;
            const planRes = await fetch(planUrl);

            if (!planRes.ok) {
                logger.warn(`School server returned error ${planRes.status} for ${planUrl}`);
                continue;
            }

            const planHtml = await planRes.text();
            const table = new Table(planHtml);

            const hours = table.getHours();
            for (const [numStr, h] of Object.entries(hours)) {
                await db
                    .insert(timetableHours)
                    .values({ number: Number(numStr), timeFrom: h.timeFrom, timeTo: h.timeTo })
                    .onConflictDoNothing();
            }

            await db.delete(timetableLessons).where(eq(timetableLessons.classId, dbClassId));

            const days = table.getDays();
            const lessonsToInsert = [];

            for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
                const hoursInDay = days[dayIdx];

                for (let hourIdx = 0; hourIdx < hoursInDay.length; hourIdx++) {
                    const lessons = hoursInDay[hourIdx];
                    if (!lessons || lessons.length === 0) continue;

                    for (const lesson of lessons) {
                        let mappedTeacherId = null;

                        const rawRoomId = lesson.roomId ? `s${lesson.roomId}` : null;
                        let mappedRoomId = rawRoomId
                            ? roomMap.get(rawRoomId)
                            : lesson.room
                              ? roomMap.get(lesson.room)
                              : null;

                        if (lesson.teacher) {
                            if (teacherMap.has(lesson.teacher)) {
                                mappedTeacherId = teacherMap.get(lesson.teacher);
                            } else {
                                logger.info(`New teacher detected: ${lesson.teacher}`);
                                const [inserted] = await db
                                    .insert(teachers)
                                    .values({ name: lesson.teacher })
                                    .onConflictDoUpdate({
                                        target: teachers.name,
                                        set: { name: lesson.teacher },
                                    })
                                    .returning({ id: teachers.id });

                                teacherMap.set(lesson.teacher, inserted.id);
                                mappedTeacherId = inserted.id;
                            }
                        }

                        lessonsToInsert.push({
                            classId: dbClassId,
                            dayOfWeek: dayIdx,
                            hourNumber: hourIdx + 1,
                            subject: lesson.subject,
                            groupName: lesson.groupName || null,
                            teacherId: mappedTeacherId,
                            roomId: mappedRoomId || null,
                            teacherNameFallback: lesson.teacher || null,
                            roomNameFallback: lesson.room || null,
                        });
                    }
                }
            }

            if (lessonsToInsert.length > 0) {
                await db.insert(timetableLessons).values(lessonsToInsert);
            } else {
                logger.warn(`No lessons found for class ${cls.name}. Empty timetable?`);
            }
        }

        logger.info('Timetable synchronization completed successfully!');
    } catch (error) {
        logger.error({ error }, 'Critical error during timetable synchronization');
        throw error;
    }
}
