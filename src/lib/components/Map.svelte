<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Map, Marker, config, helpers } from '@maptiler/sdk';
	import type { MapOptions } from '@maptiler/sdk';
	import '@maptiler/sdk/dist/maptiler-sdk.css';
	import { DeviceClass, type Device } from '$lib/types';
  import * as d3 from 'd3';

	export let devices: Device[] = [];
  export let aqiLayer: object = {};

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

    const tempExtent = d3.extent(devices, (d:Device) => d.env_temp);

    map.on('load', async () => {
      await helpers.addHeatmap(map!, {
        data: 'https://api.maptiler.com/data/cf78f6fb-6bac-446f-8a8e-4ae15c0e0201/features.json?key=eALiQdzsgc1xP3bhMxyo',
        radius: 50,
      });
      // map!.addSource('devices', {
      //   'type': 'geojson',
      //   'data': aqiLayer,
      // });

      // map!.addLayer({
      //   id: 'aqi-heatmap',
      //   type: 'heatmap',
      //   source: 'devices',
      //   maxzoom: 14,
      //   paint: {
      //     // Increase the heatmap weight based on frequency and property magnitude
      //     'heatmap-weight': [
      //       'interpolate',
      //       ['linear'],
      //       ['get', 'aqi'],
      //       0,
      //       0,
      //       120,
      //       1
      //     ],

      //     // Increase the heatmap color weight weight by zoom level
      //     // heatmap-intensity is a multiplier on top of heatmap-weight
      //     'heatmap-intensity': [
      //       'interpolate',
      //       ['linear'],
      //       ['zoom'],
      //       0,
      //       1,
      //       12,
      //       3
      //     ],

      //     // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
      //     // Begin color ramp at 0-stop with a 0-transparancy color
      //     // to create a blur-like effect.
      //     'heatmap-color': [
      //       'interpolate',
      //       ['linear'],
      //       ['heatmap-density'],
      //       0, "rgba(68, 1, 84, 0)",
      //       0.01, "rgba(68, 1, 84, 0.2)",
      //       0.13, "rgba(71, 44, 122, 1)",
      //       0.25, "rgba(59, 81, 139, 1)",
      //       0.38, "rgba(44, 113, 142, 1)",
      //       0.5, "rgba(33, 144, 141, 1)",
      //       0.63, "rgba(39, 173, 129, 1)",
      //       0.75, "rgba(92, 200, 99, 1)",
      //       0.88, "rgba(170, 220, 50, 1)",
      //       1, "rgba(253, 231, 37, 1)",
      //     ],

      //     // Adjust the heatmap radius by zoom level
      //     'heatmap-radius': [
      //       'interpolate',
      //       ['linear'],
      //       ['zoom'],
      //       0,
      //       2,
      //       9,
      //       20
      //     ],
      //     // Transition from heatmap to circle layer by zoom level
      //     'heatmap-opacity': [
      //       'interpolate',
      //       ['linear'],
      //       ['zoom'],
      //       7,
      //       1,
      //       18,
      //       0
      //     ]
      //   }
      // });
    });

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
