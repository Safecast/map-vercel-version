<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
  import * as maptilersdk from '@maptiler/sdk';
	import { Map, Marker, config, helpers } from '@maptiler/sdk';
	import type { MapOptions } from '@maptiler/sdk';
	import '@maptiler/sdk/dist/maptiler-sdk.css';
  import type { FeatureCollection } from 'geojson';
	import { DeviceClass, type Device } from '$lib/types';
  import { AqiLevel } from '$lib/aqi';
  import * as d3 from 'd3';

	export let devices: Device[] = [];
  export let aqiLayer: FeatureCollection | null = null;

	const markerSize: Array<number> = [30, 30];

	let map: Map | null = null;
  let pointLayer: any | null = null;
	let mapContainer: HTMLElement;
  let markers: Marker[] = [];
  let showMarkers: boolean = true;

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

  function addMarkers() {
    for (const marker of markers) {
      marker.addTo(map);
    }
  }

  function removeMarkers() {
    for (const marker of markers) {
      marker.remove();
    }
  }

	onMount(() => {
		const initialState = { lng: 141.021, lat: 37.424, zoom: 12 };
		const options: MapOptions = {
			container: mapContainer,
			style:
				'https://api.maptiler.com/maps/openstreetmap/?key=z5dZgfJPc4cYfwmcbFXd#0.7/22.80535/2.86559',
			center: [initialState.lng, initialState.lat],
			zoom: initialState.zoom
		};
		map = new Map(options);

    const aqiExtent = d3.extent(devices, (d:Device) => d.aqi);
    console.log(aqiExtent);
    const aqiColorScheme = new maptilersdk.ColorRamp({
      stops: [
        { value: AqiLevel.Good, color: [123, 218, 114] },
        { value: AqiLevel.Moderate, color: [240, 196, 44] },
        { value: AqiLevel.UnhealthyIfSensitive, color: [242, 137, 38] },
        { value: AqiLevel.Unhealthy, color: [236, 43, 69] },
        { value: AqiLevel.VeryUnhealthy, color: [203, 36, 176] },
        { value: AqiLevel.Hazardous, color: [100, 30, 156] },
        { value: AqiLevel.VeryHazardous, color: [0, 0, 0] },
      ]
    });

    map.on('zoom', () => {
      const zoom = map.getZoom();
      if (zoom > 9 && !showMarkers) {
        addMarkers();
        showMarkers = true;
      } else if (zoom <= 9 && showMarkers) {
        removeMarkers();
        showMarkers = false;
      }
    });

    map.on('load', async () => {
      pointLayer = await helpers.addPoint(map, {
        layerId: "devices",
        data: aqiLayer,
        property: "aqiLevel",
        pointColor: aqiColorScheme,
        pointRadius: 70,
        pointOpacity: 0.7,
        showLabel: true,
      });

      for (const device of devices) {
        if (device.loc_lon && device.loc_lat) {
          var el = document.createElement('div');
          el.className = 'marker';
          el.style.backgroundImage = deviceMarker(device);
          el.style.width = `${markerSize[0]}px`;
          el.style.height = `${markerSize[1]}px`;
          el.style.backgroundSize = `${markerSize[0]}px ${markerSize[1]}px`;

          const marker = new Marker({ element: el })
            .setLngLat([device.loc_lon, device.loc_lat]);
          markers.push(marker);
        }
      }
      if (showMarkers) {
          addMarkers();
      }
    });
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div class="w-full h-full" bind:this={mapContainer} />
