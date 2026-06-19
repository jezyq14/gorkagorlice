import { browser } from '$app/environment';
import type { UserPreferences, FavoriteTimetableItem } from '@repo/schema';
import { defaultUserPreferences } from '@repo/schema';

class PreferencesStore {
    data = $state<UserPreferences>(defaultUserPreferences);

    init(initialData: UserPreferences) {
        this.data = initialData;
    }

    private syncCookie() {
        if (!browser) return;
        document.cookie = `gorkagorlice_user_preferences=${encodeURIComponent(JSON.stringify(this.data))}; path=/; max-age=31536000; SameSite=Lax`;
    }

    // Favorite timetables
    isTimetableFavorite(type: FavoriteTimetableItem['type'], alias: string) {
        return this.data.timetableFavorites.some(f => f.type === type && f.alias === alias);
    }

    toggleTimetableFavorite(type: FavoriteTimetableItem['type'], alias: string) {
        const index = this.data.timetableFavorites.findIndex(f => f.type === type && f.alias === alias);

        if (index !== -1) {
            this.data.timetableFavorites.splice(index, 1);
        } else {
            this.data.timetableFavorites.push({ type, alias });
        }

        this.syncCookie();
    }
}

export const userPreferences = new PreferencesStore();