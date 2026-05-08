<script lang="ts">
    import type { ComponentProps } from "svelte";

    import HouseIcon from "@lucide/svelte/icons/house";
    import CloverIcon from "@lucide/svelte/icons/clover";
    import CalendarRangeIcon from "@lucide/svelte/icons/calendar-range";
    import InfoIcon from "@lucide/svelte/icons/info";
    import CircleQuestionMarkIcon from "@lucide/svelte/icons/circle-question-mark";
    import HandCoinsIcon from "@lucide/svelte/icons/hand-coins";
    import MegaphoneIcon from "@lucide/svelte/icons/megaphone";
    
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import NavUser from "$lib/components/nav-user.svelte";
    import Logo from "$lib/components/logo.svelte";

    let {
        ref = $bindable(null),
        collapsible = "icon",
        user,
        locationPath = "",
        ...restProps
    }: ComponentProps<typeof Sidebar.Root> & {
        user: { name: string; email: string; avatar: string | null } | null;
        locationPath: string;
    } = $props();

    const data = {
        // svelte-ignore state_referenced_locally
        user,
        generalNavItems: [
            {
                label: "Strona główna",
                href: "/",
                icon: HouseIcon,
                isActive: (path: string) => path === "/",
            },
            {
                label: "Szczęśliwe numerki",
                href: "/lucky-numbers",
                icon: CloverIcon,
                isActive: (path: string) => path === "/lucky-numbers",
            },
            {
                label: "Plan lekcji",
                href: "/timetable",
                icon: CalendarRangeIcon,
                isActive: (path: string) => path.startsWith("/timetable"),
            },
        ],
        classPanelNavItems: [
            {
                label: "Składki",
                href: "/payments",
                icon: HandCoinsIcon,
                isActive: (path: string) => path.startsWith("/payments"),
            },
            {
                label: "Ogłoszenia",
                href: "/announcements",
                icon: MegaphoneIcon,
                isActive: (path: string) => path.startsWith("/announcements"),
            }
        ],
        appNavItems: [
            {
                label: "Pomoc",
                href: "/help",
                icon: CircleQuestionMarkIcon,
                isActive: (path: string) => path === "/help",
            },
            {
                label: "O projekcie",
                href: "/about",
                icon: InfoIcon,
                isActive: (path: string) => path === "/about",
            }
        ]
    };
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
    <Sidebar.Header class="hidden md:block">
        <Sidebar.Menu>
            <Sidebar.MenuItem class="flex items-center justify-between">
                <Logo/>
            </Sidebar.MenuItem>
        </Sidebar.Menu>
    </Sidebar.Header>

    <Sidebar.Content>
        <Sidebar.Group>
            <Sidebar.GroupLabel>Ogólne</Sidebar.GroupLabel>
            <Sidebar.Menu>
                {#each data.generalNavItems as item}
                    <Sidebar.MenuItem>
                        <Sidebar.MenuButton tooltipContent={item.label} isActive={item.isActive(locationPath)}>
                            {#snippet child({ props })}
                                <a href={item.href} {...props}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </a>
                            {/snippet}
                        </Sidebar.MenuButton>
                    </Sidebar.MenuItem>
                {/each}
            </Sidebar.Menu>
        </Sidebar.Group>

        <Sidebar.Group>
            <Sidebar.GroupLabel>Panel klasowy</Sidebar.GroupLabel>
            <Sidebar.Menu>
                {#each data.classPanelNavItems as item}
                    <Sidebar.MenuItem>
                        <Sidebar.MenuButton tooltipContent={item.label} isActive={item.isActive(locationPath)}>
                            {#snippet child({ props })}
                                <a href={item.href} {...props}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </a>
                            {/snippet}
                        </Sidebar.MenuButton>
                    </Sidebar.MenuItem>
                {/each}
            </Sidebar.Menu>
        </Sidebar.Group>

        <Sidebar.Group>
            <Sidebar.GroupLabel>Górka Gorlice</Sidebar.GroupLabel>
            <Sidebar.Menu>
                {#each data.appNavItems as item}
                    <Sidebar.MenuItem>
                        <Sidebar.MenuButton tooltipContent={item.label} isActive={item.isActive(locationPath)}>
                            {#snippet child({ props })}
                                <a href={item.href} {...props}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </a>
                            {/snippet}
                        </Sidebar.MenuButton>
                    </Sidebar.MenuItem>
                {/each}
            </Sidebar.Menu>
        </Sidebar.Group>
    </Sidebar.Content>

    <Sidebar.Footer>
        <NavUser user={data.user} />
    </Sidebar.Footer>

    <Sidebar.Rail />
</Sidebar.Root>