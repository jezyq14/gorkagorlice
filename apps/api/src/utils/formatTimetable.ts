// format and deduplicate timetable
export function formatTimetable(allHours: any[], lessonsFlat: any[]) {
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

        // names
        const className = l.class?.friendlyName || l.class?.name || null;
        const teacherName = l.teacher?.friendlyName || l.teacher?.name || l.teacherNameFallback;
        const roomName = l.room?.friendlyName || l.room?.name || l.roomNameFallback;

        // aliases
        const classAlias = l.class?.vulcanId || null;
        const teacherAlias = l.teacher?.vulcanId || l.teacher?.name || l.teacherNameFallback;
        const roomAlias = l.room?.vulcanId || l.room?.name || l.roomNameFallback;

        // deduplication
        const isDuplicate = daysFormatted[day][hour].some(
            (existing) =>
                existing.subject === l.subject &&
                existing.groupName === l.groupName &&
                existing.classAlias === classAlias &&
                existing.teacherAlias === teacherAlias &&
                existing.roomAlias === roomAlias,
        );

        if (!isDuplicate) {
            daysFormatted[day][hour].push({
                id: l.id,
                subject: l.subject,
                groupName: l.groupName,
                className,
                classAlias,
                teacherName,
                teacherAlias,
                roomName,
                roomAlias,
            });
        }
    }

    return {
        hours: hoursFormatted,
        days: daysFormatted,
    };
}