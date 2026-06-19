import * as v from 'valibot';

export const FavoriteTimetableItemSchema = v.object({
    type: v.union([v.literal('class'), v.literal('teacher'), v.literal('room')]),
    alias: v.string(),
});

export const UserPreferencesSchema = v.object({
    timetableFavorites: v.fallback(v.array(FavoriteTimetableItemSchema), []),
});

export type FavoriteTimetableItem = v.InferOutput<typeof FavoriteTimetableItemSchema>;
export type UserPreferences = v.InferOutput<typeof UserPreferencesSchema>;

export const defaultUserPreferences: UserPreferences = {
    timetableFavorites: [],
};