<script lang="ts">
	import { env } from '$env/dynamic/public';

	import './layout.css';
	import favicon from '$lib/assets/logo.svg';

  	import { ModeWatcher } from "mode-watcher";

	let { children } = $props();
</script>

<ModeWatcher />
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
{@render children()}

