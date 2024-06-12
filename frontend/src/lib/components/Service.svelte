<script lang="ts">
    import { services } from "../../services";

    interface MyProps {
        value: string;
        size: string;
    }
    let { value, size }: MyProps = $props();

    let service = $derived(services[value]);
    let isTram = $derived(service?.type === "tram");
    let isBus = $derived(service?.type === "bus");
    let isTrolley = $derived(service?.type === "trolley");
    let bgcolor = $derived(service?.bgcolor ?? "#808080");
    let fgcolor = $derived(service?.fgcolor ?? "white");

    let isThin = $derived(value.length > 2);
</script>

<div class:thin={isThin} class:tram={isTram} class:trolley={isTrolley} class:bus={isBus} class:big={size === "big"} class:small={size === "small"} style={`background-color: ${bgcolor}; color: ${fgcolor}`}>
    <span>{value}</span>
</div>


<style>
    div {
        font-weight: bold;

        color: white;
        display: grid;
        place-items: center;
        background-color: #e31e24;

        display: grid;

        &.big {
            font-size: calc(14svh);
            height: 100%;
            aspect-ratio: 1 / 1;

            border-radius: 10%;
        }

        &.small {
            font-size: calc(5svh);
            width: calc(7svh);
            height: calc(7svh);
            border-radius: 10%;
        }

        &.thin span {
            transform: scale(.7, 1) translateX(-13%);
        }
    }

    .tram {
        border-radius: 50%;
    }
</style>