<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Map, Marker, config } from '@maptiler/sdk';
	import type { MapOptions } from '@maptiler/sdk';
	import '@maptiler/sdk/dist/maptiler-sdk.css';
	import { DeviceClass, type Device } from '$lib/types';

	export let devices: Device[] = [];

	const markerSize: Array<number> = [30, 30];

	let map: Map | null = null;
	let mapContainer: HTMLElement;

	config.apiKey = 'eALiQdzsgc1xP3bhMxyo';

	function deviceMarker(device: Device): string {
		if (
			device.device_class === DeviceClass.AIRNOTE_SOLAR ||
			device.device_class === DeviceClass.AIRNOTE_SOLAR_AIR ||
			device.device_class === DeviceClass.AIRNOTE_SOLAR_RAD
		) {
			return 'url(markers/airnote.png)';
		} else if (
			device.device_class === DeviceClass.BLUES_RADNOTE ||
			device.device_class === DeviceClass.OZZIE_RADNOTE
		) {
			return 'url(markers/radnote.png)';
		} else if (
			device.device_class === DeviceClass.GNOTE ||
			device.device_class === DeviceClass.KITTYWOOD
		) {
			return 'url(markers/testing.png)';
		} else {
			return 'url(markers/unknown.png)';
		}
	}

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
				el.style.backgroundImage = deviceMarker(device);
				el.style.width = `${markerSize[0]}px`;
				el.style.height = `${markerSize[1]}px`;
				el.style.backgroundSize = `${markerSize[0]}px ${markerSize[1]}px`;

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
