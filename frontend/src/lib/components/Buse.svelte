<script lang="ts">
    import gtfs from "$lib/gtfs/gtfs.svelte";
    import { onMount } from "svelte";
    import Route from "./Route.svelte";
    import VerticalLine from "./VerticalLine.svelte";
    import sstate from "$lib/state.svelte";
    import { HHMMSSToSeconds, nowSeconds, secondsToHHMMSS } from "$lib/datetime";

    const DEBUG = true;

    interface MyProps {
        resolvedTrip: any;
    }
    let { resolvedTrip }: MyProps = $props();

    let time = $state("")
    let isTram = $derived(resolvedTrip.route?.routeType === 0);
	let stopTimes = $derived(resolvedTrip.stopTimes)
    
	// select stop based on current time
	let currentStopIndex = $derived.by(() => {
		const nowSec = nowSeconds();
		let currentStopIndex = -1 + ticker1sec * 0;
        for (let i = 0; i < stopTimes.length; i++) {
            const stopTime = stopTimes[i];
            const stopTimeSeconds = HHMMSSToSeconds(stopTime.arrivalTime);

            if (stopTimeSeconds > nowSec) {
                currentStopIndex = i;
                break;
            }
        }
        return currentStopIndex;
	});
    let maxStopIndex = $derived.by(() => {
        return stopTimes.length - 1;
    });

    let stopsHidden = $derived(currentStopIndex + 4 < maxStopIndex);
	let selectedStopTimes = $derived.by(() => {
        if (currentStopIndex === -1) {
            return [];
        }
        // get first 4 from currentStopIndex and last stop if there are more than 4
        let toRet = []
        for (let i = currentStopIndex; i < stopTimes.length; i++) {
            const stopTime = stopTimes[i];
            toRet.push(stopTime);
            if (toRet.length >= 4) {
                break;
            }
        }
        if (currentStopIndex + 4 < stopTimes.length) {
            const stopTime = stopTimes[stopTimes.length - 1];
            toRet.push(stopTime);
        }
        return toRet;
	});

    let ticker1sec = $state(0);
	onMount(() => {
		const updateTime = () => {
			const now = gtfs.now();
			let hours24 = now.getHours();
			let minutes = now.getMinutes();
			let seconds = now.getSeconds();
			time = `${hours24 < 10 ? "0" : ""}${hours24}${seconds % 2 === 0 ? ":" : " "}${minutes < 10 ? "0" : ""}${minutes}`;
		}
		updateTime();
		const inter = setInterval(updateTime, 1000);
        const inter2 = setInterval(() => {
            ticker1sec++;
        }, 1000);

		console.log("resolvedTrip", resolvedTrip);
		return () => {
            clearInterval(inter);
            clearInterval(inter2);
        }
	});


    function leaveVehicle() {
        console.log("leaveVehicle");
        sstate.resolvedTrip = null;
    }

    function relativeArrivalTime(stopArrivalTime: string) {
        const nowSec = nowSeconds()
        const stopTimeSeconds = HHMMSSToSeconds(stopArrivalTime);
        const diffSeconds = stopTimeSeconds - nowSec;

        if (diffSeconds < 0) {
            return `-${Math.abs(diffSeconds)} sec`
        }
        else if (diffSeconds < 60) {
            return `${diffSeconds} sec`
            // return "< 1 min";
        }
        else {
            return Math.floor(diffSeconds / 60) + " min";
        }
    }
</script>


{#key ticker1sec}
<main>
    {#if DEBUG}
        <div class="debug">
            <div>{secondsToHHMMSS(nowSeconds())} ({currentStopIndex})</div>
            <div> </div>
            {#each stopTimes as stopTime}
                <div>{stopTime.arrivalTime} {stopTime.stop.stopName} {relativeArrivalTime(stopTime.arrivalTime)}</div>
            {/each}
            <div> </div>
            {#each selectedStopTimes as stopTime}
                <div>{stopTime.arrivalTime} {stopTime.stop.stopName} {relativeArrivalTime(stopTime.arrivalTime)}</div>
            {/each}
            <div> </div>
            <button onclick={()=>gtfs.moveTime(-60 * 5)}>-5 min</button>
            <button onclick={()=>gtfs.moveTime(-60)}>-1 min</button>
            <button onclick={()=>gtfs.moveTime(60)}>+1 min</button>
            <button onclick={()=>gtfs.moveTime(60 * 5)}>+5 min</button>
        </div>
    {/if}
	<header>
		<div class="notch" onclick={leaveVehicle}>
			<span>STOP</span>
		</div>
        {#if selectedStopTimes.length > 0}
            <div class="section-row">
                <div class="service">
                    <Route routeId={resolvedTrip.routeId} size="big"/>
                </div>
                <div class="vertical-line">
                    <VerticalLine color={"var(--color-header)"} showNextArrow={currentStopIndex !== maxStopIndex} isEnd={currentStopIndex === maxStopIndex} isRequestStop={!isTram} stopsHidden={false}/>
                </div>
                <div class="stop-wrapper">
                    <div class="stopname">{selectedStopTimes[0].stop.stopName}</div>
                    <div class="stop-services">
                        {#each selectedStopTimes[0].stop.routeIds as routeId}
                            {#if routeId !== resolvedTrip.routeId}
                                <Route routeId={routeId} size="medium"/>
                            {/if}
                        {/each}
                    </div>
                </div>
                <div class="area">
                    {selectedStopTimes[0].stop.zoneId}
                </div>
            </div>
        {/if}
	</header>
	<section>
		<div class="section-row">
            {#if selectedStopTimes.length > 1}
                <div class="minutes">{relativeArrivalTime(selectedStopTimes[1].arrivalTime)}</div>
                <div class="vertical-line">
                    <VerticalLine color={"var(--color-body)"} showNextArrow={currentStopIndex + 1 !== maxStopIndex} isEnd={currentStopIndex + 1 === maxStopIndex} isRequestStop={!isTram} stopsHidden={false}/>
                </div>
                <div class="stop-wrapper">
                    <div class="stopname">{selectedStopTimes[1].stop.stopName}</div>
                    <div class="stop-services">
                        {#each selectedStopTimes[1].stop.routeIds as routeId}
                            {#if routeId !== resolvedTrip.routeId}
                                <Route routeId={routeId} size="medium"/>
                            {/if}
                        {/each}
                    </div>
                </div>
                <div class="area">
                    {selectedStopTimes[1].stop.zoneId}
                </div>
            {/if}
		</div>
		<div class="section-row">
            {#if selectedStopTimes.length > 2}
                <div class="minutes">{relativeArrivalTime(selectedStopTimes[2].arrivalTime)}</div>
                <div class="vertical-line">
                    <VerticalLine color={"var(--color-body)"} showNextArrow={currentStopIndex + 2 !== maxStopIndex} isEnd={currentStopIndex + 2 === maxStopIndex} isRequestStop={!isTram} stopsHidden={false}/>
                </div>
                <div class="stop-wrapper">
                    <div class="stopname">{selectedStopTimes[2].stop.stopName}</div>
                    <div class="stop-services">
                        {#each selectedStopTimes[2].stop.routeIds as routeId}
                            {#if routeId !== resolvedTrip.routeId}
                                <Route routeId={routeId} size="medium"/>
                            {/if}
                        {/each}
                    </div>
                </div>
                <div class="area">
                    {selectedStopTimes[2].stop.zoneId}
                </div>
            {/if}
		</div>
		<div class="section-row">
            {#if selectedStopTimes.length > 3}
                <div class="minutes">{relativeArrivalTime(selectedStopTimes[3].arrivalTime)}</div>
                <div class="vertical-line">
                    <VerticalLine color={"var(--color-body)"} showNextArrow={false} isEnd={currentStopIndex + 3 === maxStopIndex} isRequestStop={!isTram} stopsHidden={false}/>
                </div>
                <div class="stop-wrapper">
                    <div class="stopname">{selectedStopTimes[3].stop.stopName}</div>
                    <div class="stop-services">
                        {#each selectedStopTimes[3].stop.routeIds as routeId}
                            {#if routeId !== resolvedTrip.routeId}
                                <Route routeId={routeId} size="medium"/>
                            {/if}
                        {/each}
                    </div>
                </div>
                <div class="area">
                    {selectedStopTimes[3].stop.zoneId}
                </div>
            {/if}
		</div>
	</section>

	<footer>
		<div class="section-row">
            {#if selectedStopTimes.length > 4}
                <div class="minutes">{relativeArrivalTime(selectedStopTimes[4].arrivalTime)}</div>
                <div class="vertical-line">
                    <VerticalLine color={"var(--color-footer)"} showNextArrow={false} isEnd={true} isRequestStop={false} stopsHidden={stopsHidden}/>
                </div>
                <div class="stop-wrapper">
                    <div class="stopname">{selectedStopTimes[4].stop.stopName}</div>
                    <div class="stop-services">
                        {#each selectedStopTimes[4].stop.routeIds as routeId}
                            {#if routeId !== resolvedTrip.routeId}
                                <Route routeId={routeId} size="medium"/>
                            {/if}
                        {/each}
                    </div>
                </div>
                <div class="area">
                    {selectedStopTimes[4].stop.zoneId}
                </div>
            {/if}
			<div class="time">
				{time}
			</div>
			<div class="version">
				10922283-289.230912
			</div>
		</div>
	</footer>
</main>
{/key}

<style>
    .debug {
        position: absolute;
        bottom: 0;
        right: 0;
        background-color: white;
        padding: 1em;
        z-index: 10;
    }
	main {
		width: 100%;
		height: 100svh;
		background-color: var(--color-body);
	}

	header {
		width: 100%;
		height: 20svh;
		background-color: var(--color-header);

		display: flex;
		align-items: center;

		position: relative;

		.notch {
			position: absolute;
			top: -8svh;
			right: 3svh;
			width: 20svh;
			height: 20svh;
			background-color: black;
			border-radius: 20%;

			color: white;
			font-size: 6svh;
			font-weight: 600;

			display: flex;
			align-items: end;
			justify-content: center;

            z-index: 10;
            cursor: pointer;

			span {
				margin-bottom: 2.5svh;
                display: none;
			}

            &:hover {
                span {
                    display: block;
                }
            }
		}
	}

	.service {
		width: 20svh;
		height: 20svh;

		padding: 1svh 2svh 1svh 0;
	}

	section {
		width: 100%;
		height: 60svh;
	}
	.section-row {
		position: relative;
		width: 100%;
		height: 20svh;
		display: flex;
		align-items: center;
		padding-left: 1svh;

		.minutes {
			font-size: 4.5svh;
			color: white;
			width: 21svh;
			text-align: right;
			padding-right: 3svh;
		}

		.vertical-line {
			position: absolute;
			left: 23svh;
			height: 100%;
		}

		.stop-wrapper {
			position: absolute;
			left: 28svh;
			width: calc(100svw - 75svh);
			overflow: hidden;

			margin-left: 3svh;

			.stopname {
				font-size: 8svh;
				font-weight: 600;
				color: white;

				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				width: 100%;
			}

			.stop-services {
				display: flex;
				flex-wrap: nowrap;
				margin-top: .5svh;
				gap: 1svh;
				width: max-content;
			}
		}

		.area {
			position: absolute;
			right: 25svh;
			width: 20svh;
			height: 100%;
			color: #c5c5c5;
			font-size: 7svh;
			display: grid;
			place-items: center;
		}
	}

	footer {
		width: 100%;
		height: 20svh;
		background-color: var(--color-footer);

		.time {
			position: absolute;
			right: 0svh;
			bottom: 0svh;
			width: 20svh;
			height: 100%;
			color: white;
			font-size: 7svh;
			display: grid;
			place-items: center;
		}

		.version {
			position: absolute;
			right: 0svh;
			bottom: 0svh;
			width: 30svh;
			height: 100%;
			font-size: 1.8svh;
			display: flex;
			align-items: end;
			justify-content: end;
			text-wrap: nowrap;
			color: #6b6b6b;
			padding: .5svh;
		}
	}

</style>