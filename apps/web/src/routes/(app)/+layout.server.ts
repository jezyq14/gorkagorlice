import { defaultUserPreferences, UserPreferencesSchema } from "@repo/schema";
import type { LayoutServerLoad } from "./$types";
import { safeParse } from "valibot";

export const load: LayoutServerLoad = async ({ locals, request, cookies }) => {
    const res = await locals.api.v1.auth.me.$get();

    if (!res.ok) {
        return {
            user: null,
            locationPath: new URL(request.url).pathname,
            preferences: defaultUserPreferences
        };
    }

    const user = await res.json();

    let preferences = defaultUserPreferences;
    const prefsCookie = cookies.get('gorka_prefs');

    if (prefsCookie) {
        try {
            const parsedJson = JSON.parse(decodeURIComponent(prefsCookie));
            const result = safeParse(UserPreferencesSchema, parsedJson);

            if (result.success) {
                preferences = result.output;
            }
        } catch (e) {
            console.error('Error while parsing preferences cookie, using defaults.', e);
        }
    }

    return {
        user: {
            avatar: user.avatar,
            email: user.email,
            name: user.name,
        },
        locationPath: new URL(request.url).pathname,
        preferences
    };
}