import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "../$types";

export const load: LayoutServerLoad = async ({ parent, locals }) => {
    const parentData = await parent();

    const response = await locals.api.v1.timetable.dictionaries.$get();

    if (!response.ok) throw error(500, "Nie udało się pobrać listy planów lekcji!");

    const timetableDictionary = await response.json();

    return {
        ...parentData,
        timetableDictionary
    }
}