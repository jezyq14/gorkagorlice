<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$lib/components/app-sidebar.svelte";
    import ThemeToggler from "$lib/components/theme-toggler.svelte";
    import MobileSidebarTrigger from "$lib/components/mobile/mobile-sidebar-trigger.svelte";

    import logoImage from "$lib/assets/logo.svg"
    import Button from "$lib/components/ui/button/button.svelte";
 
    let { children, data } = $props();
</script>

<Sidebar.Provider class="h-dvh">
    <AppSidebar locationPath={data.locationPath} user={data?.user}/>
    <main class="w-full h-full">
        <header class="px-2 md:px-4 p-2 flex items-center justify-between border-b border-border w-full">
            <div class="flex items-center gap-2">
                <Sidebar.Trigger class="hidden md:block" />
                <MobileSidebarTrigger class="md:hidden"/>
            </div>
            <Button href="/" variant="ghost"><img src={logoImage} alt="logo" class="md:hidden"></Button>
            <ThemeToggler/>
        </header>
        {@render children?.()}
    </main>
</Sidebar.Provider>