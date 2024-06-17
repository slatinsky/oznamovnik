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

        // Hide loader
        if (document) {
            let el = document.getElementById('pageloader')
            if (el) {
                el.style.display = 'none';
            }
        }

        // restore tripId from URL
        if (window.location.search) {
            const urlParams = new URLSearchParams(window.location.search);
            const tripId = urlParams.get('tripId');
            if (tripId) {
                recalculateTrip(tripId);
            }
        }
        
        inter = setInterval(() => {
            tripsNow = gtfs.getTripsNow();
            console.log("tripsNow", tripsNow);
        }, 15000);
    });

    onDestroy(() => {
        clearInterval(inter)
    });

    function recalculateTrip(tripId: string) {
        sstate.resolvedTrip = gtfs.enrichTripId(tripId);
        console.log("resolvedTrip", sstate.resolvedTrip);
    }

    function selectTrip(tripId: string) {
        recalculateTrip(tripId);
    }
</script>

<svelte:head>
    {#if sstate.resolvedTrip === null}
        <title>Oznamovník</title>
    {:else}
        <title>{sstate.resolvedTrip.tripId}</title>
    {/if}
</svelte:head>


{#if sstate.resolvedTrip == null}
    {#if isLoading}
        <!-- <p>Loading...</p> -->
    {:else}
        <h1>Nasadnite do spoja</h1>
        <div class="count">
            Aktuálne premávava {tripsNow.length} spojov
        </div>

        {#if tripsNow.length === 0}
            <p>Aktuálne premávajú žiadne spoje</p>
        {/if}
        <div class="trips">
            {#each tripsNow as trip (trip.tripId)}
                <div onclick={() => selectTrip(trip.tripId)} style="cursor: pointer;">
                    <div class="trip-row">
                        <Route routeId={trip.routeId} size="small"/>
                        <div>
                            <div>{trip.tripHeadsign}</div>
                            <small>{trip.tripId}</small>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
{:else}
    <Buse resolvedTrip={sstate.resolvedTrip} />
{/if}


<style>
    h1 {
        margin: 21px 3px 10px 3px;
    }

    .count {
        margin: 0 3px 20px 3px;
    }

    .trips {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
    .trip-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 3px;
    }
</style>