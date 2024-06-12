<script>
	import { onMount } from "svelte";
	import Service from "../lib/components/Service.svelte";
	import VerticalLine from "../lib/components/VerticalLine.svelte";

	let time = $state("")
	onMount(() => {
		const updateTime = () => {
			let hours24 = new Date().getHours();
			let minutes = new Date().getMinutes();
			let seconds = new Date().getSeconds();
			time = `${hours24 < 10 ? "0" : ""}${hours24}${seconds % 2 === 0 ? ":" : " "}${minutes < 10 ? "0" : ""}${minutes}`;
		}
		updateTime();
		const inter = setInterval(updateTime, 1000);

		return () => clearInterval(inter);
	});

</script>

<svelte:head>
	<title>Oznamovník</title>
	<meta name="description" content="Oznamovník MDH" />
</svelte:head>

<main>
	<header>
		<div class="notch">
			<span>STOP</span>
		</div>
		<div class="section-row">
			<div class="service">
				<Service value={"63"} size="big"/>
			</div>
			<div class="vertical-line">
				<VerticalLine color={"var(--color-header)"} isEnd={false} isAlmostEnd={false} isRequestStop={true}/>
			</div>
			<div class="stop-wrapper">
				<div class="stopname">Klientske centrum</div>
				<div class="stop-services">
					{#each ["39", "50", "53", "60", "61", "96", "622"] as service}
						<Service value={service} size="small"/>
					{/each}
				</div>
			</div>
			<div class="area">
				100
			</div>
		</div>
	</header>
	<section>
		<div class="section-row">
			<div class="minutes">2 min</div>
			<div class="vertical-line">
				<VerticalLine color={"var(--color-body)"} isEnd={false} isAlmostEnd={false} isRequestStop={true}/>
			</div>
			<div class="stop-wrapper">
				<div class="stopname">Sabinovská</div>
				<div class="stop-services">
					{#each ["39", "60", "61"] as service}
						<Service value={service} size="small"/>
					{/each}
				</div>
			</div>
			<div class="area">
				100
			</div>
		</div>
		<div class="section-row">
			<div class="minutes">3 min</div>
			<div class="vertical-line">
				<VerticalLine color={"var(--color-body)"} isEnd={false} isAlmostEnd={false} isRequestStop={true}/>
			</div>
			<div class="stop-wrapper">
				<div class="stopname">Bajkalská</div>
				<div class="stop-services">
					{#each ["39", "60", "61", "78", "98", "540", "550", "610", "620", "622", "630", "632"] as service}
						<Service value={service} size="small"/>
					{/each}
				</div>
			</div>
			<div class="area">
				100
			</div>
		</div>
		<div class="section-row">
			<div class="minutes">5 min</div>
			<div class="vertical-line">
				<VerticalLine color={"var(--color-body)"} isEnd={false} isAlmostEnd={true} isRequestStop={true}/>
			</div>
			<div class="stop-wrapper">
				<div class="stopname">TIPOS Aréna</div>
				<div class="stop-services">
					{#each ["39", "47", "60", "61", "78"] as service}
						<Service value={service} size="small"/>
					{/each}
				</div>
			</div>
			<div class="area">
				100
			</div>
		</div>
	</section>

	<footer>
		<div class="section-row">
			<div class="minutes">27 min</div>
			<div class="vertical-line">
				<VerticalLine color={"var(--color-footer)"} isEnd={true} isAlmostEnd={false} isRequestStop={false}/>
			</div>
			<div class="stop-wrapper">
				<div class="stopname">Lamač</div>
				<div class="stop-services">
					{#each ["30"] as service}
						<Service value={service} size="small"/>
					{/each}
				</div>
			</div>
			<div class="area">
				100
			</div>
			<div class="time">
				{time}
			</div>
			<div class="version">
				10922283-289.230912
			</div>
		</div>
	</footer>
</main>

<style>
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

			span {
				margin-bottom: 2.5svh;
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
