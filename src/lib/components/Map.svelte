<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Map, MapStyle, config } from '@maptiler/sdk';
	import '@maptiler/sdk/dist/maptiler-sdk.css';

	let map;
	let mapContainer;

	config.apiKey = 'eALiQdzsgc1xP3bhMxyo';

	onMount(() => {
		const initialState = { lng: 141.021, lat: 37.424, zoom: 12 };

		map = new Map({
			container: mapContainer,
			style:
				'https://api.maptiler.com/maps/b946056e-74c5-4c2b-bfeb-4c580c588f62/style.json?key=eALiQdzsgc1xP3bhMxyo',
			center: [initialState.lng, initialState.lat],
			zoom: initialState.zoom
		});
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div class="w-full h-full" bind:this={mapContainer} />
