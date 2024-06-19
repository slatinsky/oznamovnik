<script lang="ts">
    import Buse from '$lib/components/Buse.svelte';
    import SelectTrip from '$lib/components/SelectTrip.svelte';
    import sstate from '$lib/state.svelte';

</script>

<svelte:head>
    {#if sstate.resolvedTrip === null}
        <title>Oznamovník</title>
    {:else}
        <title>{sstate.resolvedTrip.tripId}</title>
    {/if}
</svelte:head>


{#if sstate.resolvedTrip == null}
    <SelectTrip />
{:else}
    <Buse resolvedTrip={sstate.resolvedTrip} />
{/if}


