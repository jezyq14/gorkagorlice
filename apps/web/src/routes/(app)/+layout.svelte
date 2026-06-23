<script lang="ts">
    import * as Sidebar from '$lib/components/ui/sidebar/index.js';
    import AppSidebar from '$lib/components/app-sidebar.svelte';
    import ThemeToggler from '$lib/components/theme-toggler.svelte';
    import MobileSidebarTrigger from '$lib/components/mobile/mobile-sidebar-trigger.svelte';

    import logoImage from '$lib/assets/logo.svg';
    import Button from '$lib/components/ui/button/button.svelte';
    import { userPreferences } from '$lib/states/preferences.svelte';

    let { children, data } = $props();

    userPreferences.init(data.preferences);
</script>

<Sidebar.Provider class="h-dvh">
    <AppSidebar locationPath={data.locationPath} user={data?.user} />
    <main class="flex h-full w-full flex-col">
        <header
            class="border-border flex w-full items-center justify-between border-b p-2 px-2 md:px-4"
        >
            <div class="flex items-center gap-2">
                <Sidebar.Trigger class="hidden md:block" />
                <MobileSidebarTrigger class="md:hidden" />
            </div>
            <Button href="/" variant="ghost" class="md:hidden"
                ><img src={logoImage} alt="logo" /></Button
            >
            <ThemeToggler />
        </header>
        <div class="flex-1">{@render children?.()}</div>
    </main>
</Sidebar.Provider>
