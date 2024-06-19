<script lang="ts">
    import Route from '$lib/components/Route.svelte';
    import gtfs, { type GtfsTrip } from '$lib/gtfs/gtfs.svelte';
    import { onDestroy, onMount } from 'svelte';
    import sstate from '$lib/state.svelte';

    onMount(async () => {
        const todaysServiceIds = await gtfs.getTodaysServiceIds();
        console.log("todaysServiceIds", todaysServiceIds);

        tripsNow = gtfs.getTripsNow();
        console.log("tripsNow", tripsNow);

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
            // console.log("tripsNow", tripsNow);
        }, 1000);
    });
    
    let tripsNow: GtfsTrip[] = $state([]);
    let inter:number;


    function recalculateTrip(tripId: string) {
        sstate.resolvedTrip = gtfs.enrichTripId(tripId);
        console.log("resolvedTrip", sstate.resolvedTrip);
    }
    function selectTrip(tripId: string) {
        recalculateTrip(tripId);
    }


    onDestroy(() => {
        clearInterval(inter)
    });

</script>

<h1>Nasadnite do spoja</h1>
<div class="count">
    {#if tripsNow.length === 0}
       Aktuálne premávajú žiadne spoje
    {:else}
        Aktuálne premávava {tripsNow.length} spojov
    {/if}
</div>


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