<script lang="ts">
    import User from "@lucide/svelte/icons/user";
    import Contact from "@lucide/svelte/icons/contact";

    import * as Card from "$lib/components/ui/card";

    import LogoIcon from "$lib/assets/logo-with-text.svg";
    import SzczurPlatformBadge from "$lib/assets/szczur-platform-badge.svg";
    import { Button } from "$lib/components/ui/button";

    let { data } = $props();
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center">
    <div class="mx-auto flex w-full flex-col justify-center space-y-6 px-6 sm:w-[400px] md:w-[500px]">
        <a href="/" class="w-[250px] mx-auto cursor-pointer"><img src={LogoIcon} alt="logo" class="w-[250px]"></a>

        <Card.Root>
            <Card.Header>
                <Card.Title class="text-xl font-bold">O projekcie</Card.Title>
                <Card.Description>
                    Strona osadzona wokół ZS1 Gorlice.
                </Card.Description>
                <Card.Action>
                    <Button variant="link"><a href="/">Powrót</a></Button>
                </Card.Action>
            </Card.Header>
            <Card.Content class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                    <User size={16}/>
                    <p class="font-bold">Autorzy</p>
                </div>
                <ul class="list-disc list-inside p-1">
                    {#each data.authors as author}
                        <li class="text-sm">{author}</li>
                    {/each}
                </ul>
            </div>

            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                    <Contact size={16}/>
                    <p class="font-semibold">Kontakt</p>
                </div>
                <ul class="list-disc list-inside p-1">
                    <li>E-mail: <a href="mailto:{data.mail}" class="text-chart-2">{data.mail}</a></li>
                    <li>GitHub: <a href={data.github} class="text-chart-2">Klik!</a></li>
                    <li>Discord: <a href={data.discord} class="text-chart-2">Klik!</a></li>
                </ul>
            </div>
            
            <img src={SzczurPlatformBadge} alt="" width="150" class="mx-auto">
            </Card.Content>
            <Card.Footer>
                <p class="hover:underline text-center w-full"><a href={data.github}>&#127279; Copyleft 2026 - Górka Gorlice</a></p>
            </Card.Footer>
        </Card.Root>

    </div>
</div>