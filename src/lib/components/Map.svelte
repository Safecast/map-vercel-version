<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Map, Marker, config } from '@maptiler/sdk';
	import type { MapOptions } from '@maptiler/sdk';
	import '@maptiler/sdk/dist/maptiler-sdk.css';
	import type { Device } from '$lib/types';

	export let devices: Device[] = [];

	let map: Map | null = null;
	let mapContainer: HTMLElement;

	config.apiKey = 'eALiQdzsgc1xP3bhMxyo';

	onMount(() => {
		const initialState = { lng: 141.021, lat: 37.424, zoom: 12 };
		const options: MapOptions = {
			container: mapContainer,
			style:
				'https://api.maptiler.com/maps/b946056e-74c5-4c2b-bfeb-4c580c588f62/style.json?key=eALiQdzsgc1xP3bhMxyo',
			center: [initialState.lng, initialState.lat],
			zoom: initialState.zoom
		};
		map = new Map(options);

		console.log(devices);
		for (const device of devices) {
			if (device.loc_lon && device.loc_lat) {
				var el = document.createElement('div');
				el.className = 'marker';
				el.style.backgroundImage = `url(markers/safecast.png)`;
				el.style.width = '25px';
				el.style.height = '25px';

				// el.addEventListener('click', function () {
				// 	window.alert(marker.properties.message);
				// });
				const marker = new Marker({
					element: el
				})
					.setLngLat([device.loc_lon, device.loc_lat])
					.addTo(map);
			}
		}
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div class="w-full h-full" bind:this={mapContainer} />
