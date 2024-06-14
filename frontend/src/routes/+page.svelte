<script lang="ts">
    import Buse from '$lib/components/Buse.svelte';
    import Route from '$lib/components/Route.svelte';
    import gtfs, { type GtfsTrip } from '$lib/gtfs/gtfs.svelte';
    import sstate from '$lib/state.svelte';

    import { onDestroy, onMount } from 'svelte';

    let isLoading = $state(true)

    let tripsNow: GtfsTrip[] = $state([]);
    let inter:number;

    onMount(async () => {
        await gtfs.init();
        const todaysServiceIds = await gtfs.getTodaysServiceIds();
        console.log("todaysServiceIds", todaysServiceIds);

        
        tripsNow = gtfs.getTripsNow();
        console.log("tripsNow", tripsNow);
        isLoading = false;
        
        inter = setInterval(() => {
            tripsNow = gtfs.getTripsNow();
            console.log("tripsNow", tripsNow);
        }, 15000);
    });

    onDestroy(() => {
        clearInterval(inter)
    });

    function fetchTrip(tripId: string) {
        sstate.resolvedTrip = gtfs.enrichTripId(tripId);
        console.log("resolvedTrip", sstate.resolvedTrip);
        // console.log("resolvedTrip", JSON.stringify(sstate.resolvedTrip, null, 2));
    }

</script>


{#if sstate.resolvedTrip == null}
    {#if isLoading}
        <p>Loading...</p>
    {:else}
        <h1>Nasadnite do linky</h1>

        {#if tripsNow.length === 0}
            <p>Aktuálne premávajú žiadne spoje</p>
        {/if}
        {#each tripsNow as trip (trip.tripId)}
            <div onclick={() => fetchTrip(trip.tripId)} style="cursor: pointer;">
                <div class="trip-row">
                    <Route routeId={trip.routeId} size="small"/>
                    <div>
                        <div>{trip.tripHeadsign}</div>
                        <small>{trip.tripId}</small>
                    </div>
                </div>
            </div>
        {/each}
    {/if}
{:else}
    <Buse resolvedTrip={sstate.resolvedTrip} />
{/if}


<style>
    h1 {
        margin: 21px 3px;
    }
    .trip-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 3px;
    }
</style>