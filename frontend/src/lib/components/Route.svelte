<script lang="ts">
    import gtfs from "$lib/gtfs/gtfs.svelte";

    interface MyProps {
        routeId: string;
        size: string;
    }
    let { routeId, size }: MyProps = $props();


    let route = $derived(gtfs.routeLookup[routeId]);
    let routeShortName = $derived(route?.routeShortName);
    let isTram = $derived(route?.routeType === 0);
    let isBus = $derived(route?.routeType === 3);
    let isTrolley = $derived(route?.routeType === 7);
    let bgcolor = $derived(route?.routeColor ?? "#808080");
    let fgcolor = $derived(route?.routeTextColor ?? "white");
    let isThin = $derived(routeShortName?.length > 2);
</script>

<div class:thin={isThin} class:tram={isTram} class:trolley={isTrolley} class:bus={isBus} class:big={size === "big"} class:medium={size === "medium"}  class:small={size === "small"} style={`background-color: #${bgcolor}; color: #${fgcolor}`}>
    <span>{routeShortName}</span>
</div>


<style>
    div {
        font-weight: bold;

        color: white;
        display: grid;
        place-items: center;
        background-color: #e31e24;

        display: grid;
        
        border-radius: 10%;
        &.big {
            font-size: calc(14svh);
            height: 100%;
            aspect-ratio: 1 / 1;

        }

        &.medium {
            font-size: calc(5svh);
            width: calc(7svh);
            height: calc(7svh);
        }

        &.small {
            font-size: 28px;
            width: 40px;
            aspect-ratio: 1 / 1;
        }

        &.thin span {
            transform: scale(.7, 1) translateX(-13%);
        }
    }

    .tram {
        border-radius: 50%;
    }
</style>