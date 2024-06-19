<script>
    import gtfs from '$lib/gtfs/gtfs.svelte';
    import { onMount } from 'svelte';
	import './styles.css';

	let isLoading = $state(true);
	onMount(async () => {
		await gtfs.init();
		isLoading = false;
	});
</script>

{#if !isLoading}
<div class="app">
	<slot />
</div>
{/if}
