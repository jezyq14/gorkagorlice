<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { userPreferences } from '$lib/states/preferences.svelte';
    import LoaderCircle from '@lucide/svelte/icons/loader-circle';

    let { data } = $props();

    onMount(() => {
        const favs = userPreferences.data.timetableFavorites;

        if (favs.length > 0) {
            const first = favs[0];
            goto(`/timetable/${first.type}/${first.alias}`, { replaceState: true });
        } else if (data.timetableDictionary?.classes?.length > 0) {
            const firstClass = data.timetableDictionary.classes[0];
            goto(`/timetable/class/${firstClass.alias}`, { replaceState: true });
        }
    });
</script>

<div class="text-muted-foreground flex h-full w-full items-center justify-center">
    <LoaderCircle class="text-primary h-8 w-8 animate-spin" />
</div>
