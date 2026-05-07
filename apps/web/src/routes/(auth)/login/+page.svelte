<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Alert, AlertDescription, AlertTitle } from "$lib/components/ui/alert";
    import AlertCircle from "@lucide/svelte/icons/alert-circle"
    import ArrowRight from "@lucide/svelte/icons/arrow-right"
    import GraduationCap from "@lucide/svelte/icons/graduation-cap"

    import { AUTH_ERRORS, type AuthErrorReason } from "@repo/schema";
    
    let { data } = $props();

    const activeError = $derived((data.error in AUTH_ERRORS) 
        ? AUTH_ERRORS[data.error as AuthErrorReason] 
        : AUTH_ERRORS.default)
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
                Zaloguj się kontem szkolnym, aby kontynuować.
            </p>
        </div>

        <Card.Root>
            <Card.Header>
                <Card.Title>Logowanie</Card.Title>
                <Card.Description>
                    Wykorzystujemy logowanie przez Google.
                </Card.Description>
            </Card.Header>
            <Card.Content class="grid gap-4">
                
                {#if activeError}
                    <Alert variant="destructive">
                        <AlertCircle class="h-4 w-4" />
                        <AlertTitle>{activeError.title}</AlertTitle>
                        <AlertDescription>
                            {activeError.desc}
                        </AlertDescription>
                    </Alert>
                {/if}

                
            </Card.Content>
            <Card.Footer>
                <Button variant="default" class="w-full" href="/login">
                    Spróbuj ponownie <ArrowRight class="ml-2 h-4 w-4" />
                </Button>
            </Card.Footer>
        </Card.Root>

    </div>
</div>