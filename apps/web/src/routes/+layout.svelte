<script lang="ts">
    import { env } from '$env/dynamic/public';

    import { onNavigate } from '$app/navigation';
    import { navigating } from '$app/state';

    import './layout.css';
    import favicon from '$lib/assets/logo.svg';

    import { ModeWatcher } from 'mode-watcher';

    let { children } = $props();

    let isNavigating = $derived(!!navigating.to);

    onNavigate((navigation) => {
        if (!document.startViewTransition) return;

        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
    });
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <title>Górka Gorlice</title>
    {#if env.PUBLIC_UMAMI_URL && env.PUBLIC_UMAMI_WEBSITE_ID}
        <script
            async
            src="{env.PUBLIC_UMAMI_URL}/script.js"
            data-website-id={env.PUBLIC_UMAMI_WEBSITE_ID}
        ></script>
    {/if}
</svelte:head>

<ModeWatcher />

{#if isNavigating}
    <div class="bg-primary/20 fixed top-0 left-0 z-50 h-0.5 w-full overflow-hidden">
        <div class="bg-primary animate-progress h-full origin-left"></div>
    </div>
{/if}

{@render children()}
