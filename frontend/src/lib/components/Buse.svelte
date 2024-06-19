<script lang="ts">
    import gtfs, { type GtfsStopTimeWithStop } from "$lib/gtfs/gtfs.svelte";
    import { onMount } from "svelte";
    import Route from "./Route.svelte";
    import VerticalLine from "./VerticalLine.svelte";
    import sstate from "$lib/state.svelte";
    import { HHMMSSToSeconds, nowSeconds, secondsToHHMMSS } from "$lib/datetime";
    import tts from "$lib/gtfs/tts.svelte";

    let DEBUG = $state(false);

    interface MyProps {
        resolvedTrip: any;
    }
    let { resolvedTrip }: MyProps = $props();

    let time = $state("")
    let isTram = $derived(resolvedTrip.route?.routeType === 0);
	let stopTimes: GtfsStopTimeWithStop[] = $derived(resolvedTrip.stopTimes)

    let lastStopName = ""
    let lastStopIndex = $state(-1);

    let currentStopIndex = $state(-1);
    let maxStopIndex = $derived.by(() => {
        return stopTimes.length - 1;
    });
    let selectedStopTimes: GtfsStopTimeWithStop[] = $state([]);
    let stopsHidden = $derived(currentStopIndex + 4 < maxStopIndex);
    let updateTick = $state(0);

    let stopArrivingAnnounced = $state(false);
    let stopArrivalAnnounced = $state(false);
    function update() {
        updateTime()
        const nowSec = nowSeconds();
		let currentStopIndexCandidate = -1;
        for (let i = 0; i < stopTimes.length; i++) {
            const stopTime = stopTimes[i];
            const stopTimeSeconds = HHMMSSToSeconds(stopTime.arrivalTime);

            if (stopTimeSeconds > nowSec) {
                currentStopIndexCandidate = i;
                break;
            }
        }
        currentStopIndex = currentStopIndexCandidate

        if (currentStopIndex !== lastStopIndex) {
            stopArrivalAnnounced = false;
            stopArrivingAnnounced = false;
            lastStopIndex = currentStopIndex;
            tts.stop();
        }

        // announce current stop
        if (currentStopIndex !== -1) {
            const stopTime = stopTimes[currentStopIndex];
            const relativeArrivalTime = relativeArrivalTimeSeconds(stopTime.arrivalTime);
            // announce arrival 15 seconds before leaving the stop
            if (relativeArrivalTime <= 15) {
                if (!stopArrivalAnnounced) {
                    stopArrivalAnnounced = true;
                    stopArrivingAnnounced = false;
                    let stopCode = stopTime.stop.stopCode;
                    tts.stop();
                    tts.playStop(stopCode);
                    if (currentStopIndex === stopTimes.length - 1) {
                        tts.playExtra('003-ekologicky')
                    }
                    if (stopCode == "80") {  // blumentál
                        tts.playExtra('002-opatrnost')
                    }
                }
            }
            else if (!stopArrivingAnnounced) {
                stopArrivingAnnounced = true;
                stopArrivalAnnounced = false;
                let stopCode = stopTime.stop.stopCode;
                tts.stop();
                tts.playExtra('004-nasleduje')
                tts.playStop(stopCode);
                if (!isTram) {
                    tts.playExtra('005-znamenie')
                }
            }
        }


        // selectedStopTimes
        let toRet = []
        if (currentStopIndex !== -1) {
            // get first 4 from currentStopIndex and last stop if there are more than 4
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
        }

        selectedStopTimes = toRet;
        updateTick++;
    }

    
	const updateTime = () => {
        const now = gtfs.now();
        let hours24 = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        time = `${hours24 < 10 ? "0" : ""}${hours24}${seconds % 2 === 0 ? ":" : " "}${minutes < 10 ? "0" : ""}${minutes}`;
    }

	onMount(() => {
        update()
        const inter2 = setInterval(() => {
            update()
        }, 1000);

		console.log("resolvedTrip", resolvedTrip);
		return () => {
            clearInterval(inter2);
        }
	});


    function leaveVehicle() {
        console.log("leaveVehicle");
        tts.stop();
        sstate.resolvedTrip = null;
    }

    function relativeArrivalTimeSeconds(stopArrivalTime: string) {
        const nowSec = nowSeconds()
        const stopTimeSeconds = HHMMSSToSeconds(stopArrivalTime);
        const diffSeconds = stopTimeSeconds - nowSec;

        return diffSeconds;
    }

    function relativeArrivalTime(stopArrivalTime: string) {
        const diffSeconds = relativeArrivalTimeSeconds(stopArrivalTime);

        if (diffSeconds < 0) {
            return `-${Math.abs(diffSeconds)} sec`
        }
        else if (diffSeconds < 60) {
            return "< 1 min";
        }
        else {
            return Math.floor(diffSeconds / 60) + " min";
        }
    }
</script>

{#if selectedStopTimes !== null}
{#key updateTick}
<main>
    {#if DEBUG}
        <div class="debug">
            <div>{secondsToHHMMSS(nowSeconds())} ({currentStopIndex})</div>
            <div> </div>
            {#each stopTimes as stopTime}
                <div class="clickable" onclick={()=>{gtfs.moveTime(relativeArrivalTimeSeconds(stopTime.arrivalTime) - 30);update()}}>
                    {stopTime.arrivalTime} {stopTime.stop.stopName} {relativeArrivalTimeSeconds(stopTime.arrivalTime)} sec
                </div>
            {/each}
            <div> </div>
            {#each selectedStopTimes as stopTime}
                <div class="clickable" onclick={()=>{gtfs.moveTime(relativeArrivalTimeSeconds(stopTime.arrivalTime) - 30);update()}}>
                    {stopTime.arrivalTime} {stopTime.stop.stopName} {relativeArrivalTimeSeconds(stopTime.arrivalTime)} sec
                </div>
            {/each}
            <div> </div>
            <button onclick={()=>{gtfs.moveTime(-60);update()}}>-1 min</button>
            <button onclick={()=>{gtfs.moveTime(-15);update()}}>-15 sec</button>
            <button onclick={()=>{gtfs.moveTime(15);update()}}>+15 sec</button>
            <button onclick={()=>{gtfs.moveTime(60);update()}}>+1 min</button>
            <button onclick={()=>{gtfs.resetTime();update()}}>now</button>
        </div>
    {/if}
	<header>
		<div class="notch" onclick={leaveVehicle}>
			<span>STOP</span>
		</div>
        {#if stopTimes.length > 0}
            <div class="section-row">
                <div class="service clickable" onclick={()=>{gtfs.moveTime(relativeArrivalTimeSeconds(stopTimes[0].arrivalTime) - 30);update()}}>
                    <Route routeId={resolvedTrip.routeId} size="big"/>
                </div>
                {#if selectedStopTimes.length > 0}
                    <div class="vertical-line">
                        <VerticalLine color={"var(--color-header)"} showNextArrow={currentStopIndex !== maxStopIndex} isEnd={currentStopIndex === maxStopIndex} isRequestStop={selectedStopTimes[0].dropOffType === 3} stopsHidden={false}/>
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
                {/if}
            </div>
        {/if}
	</header>
	<section>
		<div class="section-row">
            {#if selectedStopTimes.length > 1}
                <div class="minutes">{relativeArrivalTime(selectedStopTimes[1].arrivalTime)}</div>
                <div class="vertical-line">
                    <VerticalLine color={"var(--color-body)"} showNextArrow={currentStopIndex + 1 !== maxStopIndex} isEnd={currentStopIndex + 1 === maxStopIndex} isRequestStop={selectedStopTimes[1].dropOffType === 3} stopsHidden={false}/>
                </div>
                <div class="stop-wrapper">
                    <div class="stopname clickable" onclick={()=>{gtfs.moveTime(relativeArrivalTimeSeconds(selectedStopTimes[1].arrivalTime) - 30);update()}}>{selectedStopTimes[1].stop.stopName}</div>
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
                    <VerticalLine color={"var(--color-body)"} showNextArrow={currentStopIndex + 2 !== maxStopIndex} isEnd={currentStopIndex + 2 === maxStopIndex} isRequestStop={selectedStopTimes[2].dropOffType === 3} stopsHidden={false}/>
                </div>
                <div class="stop-wrapper">
                    <div class="stopname clickable" onclick={()=>{gtfs.moveTime(relativeArrivalTimeSeconds(selectedStopTimes[2].arrivalTime) - 30);update()}}>{selectedStopTimes[2].stop.stopName}</div>
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
                    <VerticalLine color={"var(--color-body)"} showNextArrow={false} isEnd={currentStopIndex + 3 === maxStopIndex} isRequestStop={selectedStopTimes[3].dropOffType === 3} stopsHidden={false}/>
                </div>
                <div class="stop-wrapper">
                    <div class="stopname clickable" onclick={()=>{gtfs.moveTime(relativeArrivalTimeSeconds(selectedStopTimes[3].arrivalTime) - 30);update()}}>{selectedStopTimes[3].stop.stopName}</div>
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
                    <VerticalLine color={"var(--color-footer)"} showNextArrow={false} isEnd={true} isRequestStop={selectedStopTimes[4].dropOffType === 3} stopsHidden={stopsHidden}/>
                </div>
                <div class="stop-wrapper">
                    <div class="stopname clickable" onclick={()=>{gtfs.moveTime(relativeArrivalTimeSeconds(selectedStopTimes[4].arrivalTime) - 30);update()}}>{selectedStopTimes[4].stop.stopName}</div>
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
			<div class="version" onclick={()=> DEBUG = !DEBUG}>
				10922283-289.230912
			</div>
		</div>
	</footer>
</main>
{/key}
{/if}

<style>

    .clickable {
        cursor: pointer;
    }
    .debug {
        position: absolute;
        bottom: 20svh;
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

            cursor: pointer;
		}
	}

</style>
