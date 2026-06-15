import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
    const type = params.type;
    const id = params.id;

    let response;
    if (type === 'class') {
        response = await locals.api.v1.timetable.class[':alias'].$get({ param: { alias: id } });
    } else if (type === 'room') {
        response = await locals.api.v1.timetable.room[':alias'].$get({ param: { alias: id } });
    } else if (type === 'teacher') {
        response = await locals.api.v1.timetable.teacher[':alias'].$get({ param: { alias: id } });
    } else {
        throw error(500, "Niepoprawny typ planu lekcji!");
    }

    if (!response?.ok) {
        throw error(500, "Nie udało się pobrać planu lekcji!");
    }

    const timetable = await response.json();

    return {
        timetable
    }
}