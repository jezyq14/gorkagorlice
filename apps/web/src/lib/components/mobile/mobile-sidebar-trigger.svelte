<script lang="ts">
    import MenuIcon from "@lucide/svelte/icons/menu";

    import { useSidebar } from "$lib/components/ui/sidebar/index.js";
    import Button from "../ui/button/button.svelte";
    const sidebar = useSidebar();
``
    let { class: className = "" } = $props();
</script>

<Button variant="ghost" size="icon" onclick={() => sidebar.toggle()} class={className}><MenuIcon/></Button>