<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import LogOutIcon from "@lucide/svelte/icons/log-out";
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import { fade } from "svelte/transition";
    import GraduationCap from "@lucide/svelte/icons/graduation-cap";

  const redirect = () => {
    window.location.href = "/";
  }
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center">
    <div class="mx-auto flex w-full flex-col justify-center space-y-6 px-6 sm:w-[400px] md:w-[500px]">
        <div class="flex flex-col space-y-2 text-center">
            <div class="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                <GraduationCap class="h-10 w-10 text-primary" />
            </div>
            <h1 class="text-2xl font-semibold tracking-tight text-balance">
                Górka Gorlice
            </h1>
            <p class="text-sm text-muted-foreground">
                Pomyślnie wylogowano.
            </p>
        </div>

        <Card.Root>
            <Card.Header>
                <Card.Title>Wylogowano pomyślnie</Card.Title>
                <Card.Description>
                    Zostałeś pomyślnie wylogowany ze swojego konta!
                </Card.Description>
            </Card.Header>
            <Card.Footer>
                <Button class="w-full cursor-pointer" variant="default" onclick={redirect}>
                    <ArrowLeftIcon class="h-4 w-4" />
                    Wróć do strony głównej
                </Button>
            </Card.Footer>
        </Card.Root>
    </div>
</div>