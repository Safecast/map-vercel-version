<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { PageData } from './$types';
  import { type Device, Layer, AqiLevel, DeviceClass } from '$lib/types';
  import { Map, type MapOptions, ColorRamp, ColorRampCollection, helpers, config } from '@maptiler/sdk';
  import type { FeatureCollection } from 'geojson';
  import { extent } from 'd3';
  import '@maptiler/sdk/dist/maptiler-sdk.css';
  import { calculateAqi } from '$lib/aqi';

  import { ssp, queryParameters } from 'sveltekit-search-params';

  const mapState = queryParameters({
		layer: ssp.string(Layer.AIR),
		lng: ssp.number(138.41),
    lat: ssp.number(36.09),
    zoom: ssp.number(6.25),
	});

  export let data: PageData;

  let layerData: FeatureCollection;
  let layerDef: {
    pointLayerId: string;
    clusterLayerId: string;
    labelLayerId: string;
    pointSourceId: string;
  };
  let color: ColorRamp;
  let property: string;

  let mapContainer: HTMLElement;
  let map: Map;

  config.apiKey = 'eALiQdzsgc1xP3bhMxyo';

  const usCorrectedAqiColorScheme = new ColorRamp({
    stops: [
      { value: AqiLevel.Good, color: [28, 152, 48] },
      { value: AqiLevel.Moderate, color: [251, 200, 24] },
      { value: AqiLevel.UnhealthyIfSensitive, color: [255, 154, 3] },
      { value: AqiLevel.Unhealthy, color: [236, 43, 69] },
      { value: AqiLevel.VeryUnhealthy, color: [203, 36, 176] },
      { value: AqiLevel.Hazardous, color: [100, 30, 156] },
      { value: AqiLevel.VeryHazardous, color: [0, 0, 0] },
    ]
  });

  const safecastRadiationColorScheme = new ColorRamp({
    stops: [
      { value: 12, color: [88, 129, 200] },
      { value: 35, color: [159, 191, 240] },
      { value: 55, color: [204, 167, 223] },
      { value: 150, color: [233, 116, 127] },
      { value: 250, color: [240, 229, 125] },
      // { value: AqiLevel.Hazardous, color: [255, 255, 255] },
    ]
  });

  function airDevices(device: Device): boolean {
    if (device.loc_lon == null || device.loc_lat == null) return false;
    return device.device_class === DeviceClass.AIRNOTE_SOLAR ||
      device.device_class === DeviceClass.AIRNOTE_SOLAR_AIR ||
      device.device_class === DeviceClass.AIRNOTE_SOLAR_RAD;
  }

  function radDevices(device: Device): boolean {
    if (device.loc_lon == null || device.loc_lat == null || device.lnd_7318u === undefined) return false;
    return device.device_class === DeviceClass.SAFECAST ||
      device.device_class === DeviceClass.GEIGIECAST;
  }

  function createRadGeoJSON(devices: Device[]): FeatureCollection {
    return {
      type: 'FeatureCollection',
      features: devices.map(device => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [device.loc_lon, device.loc_lat],
        },
        properties: {
          title: device.device,
          description: device.device_urn,
          device_class: device.device_class,
          rad: device.lnd_7318u,
        },
      })),
    };
  }

  function createAirGeoJSON(devices: Device[]): FeatureCollection {
    return {
      type: 'FeatureCollection',
      features: devices.map(device => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [device.loc_lon, device.loc_lat],
        },
        properties: {
          title: device.device,
          description: device.device_urn,
          device_class: device.device_class,
          aqi: device.opc_aqi,
          aqiLevel: device.opc_aqiLevel,
        },
      })),
    };
  }

  async function initLayer(layer: string) {
    if (layer === Layer.AIR) {
      layerData = createAirGeoJSON(data.devices.filter(airDevices).map(calculateAqi));
      color = usCorrectedAqiColorScheme;
      property = "aqiLevel";
    } else if (layer === Layer.RADIATION) {
      layerData = createRadGeoJSON(data.devices.filter(radDevices));
      const minMaxRad = extent(layerData.features, d => d.properties.rad);
      color = safecastRadiationColorScheme;
      // color = ColorRampCollection.PORTLAND.scale(minMaxRad[0], minMaxRad[1]).resample("ease-out-sqrt")
      property = "rad";
    }

    layerDef = await helpers.addPoint(map, {
        data: layerData,
        property: property,
        pointColor: color,
        pointRadius: 65,
        pointOpacity: 1,
        showLabel: false,
        outline: true,
        outlineWidth: [
          {zoom: 6, value: 0},
          {zoom: 7, value: 1},
          {zoom: 12, value: 5},
        ],
        outlineOpacity: [
          {zoom: 7, value: 0},
          {zoom: 10, value: 1},
        ],
        outlineColor: "#fff",
      });
    
    if (layer === Layer.AIR) {
      await map.addLayer({
          'id': `${layerDef.pointLayerId}-labels`,
          'type': 'symbol',
          'source': layerDef.pointSourceId,
          'layout': {
              'text-field': [
                  'number-format',
                  ['get', 'aqi'],
                  { 'min-fraction-digits': 0, 'max-fraction-digits': 0 }
              ],
              'text-font': ['Roboto'],
              'text-size': 10
          },
          'paint': {
              'text-color': 'white'
          }
      });
    } else if (layer === Layer.RADIATION) {
      await map.addLayer({
          'id': `${layerDef.pointLayerId}-labels`,
          'type': 'symbol',
          'source': layerDef.pointSourceId,
          'layout': {
              'text-field': [
                  'number-format',
                  ['get', 'rad'],
                  { 'min-fraction-digits': 0, 'max-fraction-digits': 0 }
              ],
              'text-font': ['Roboto'],
              'text-size': 10
          },
          'paint': {
              'text-color': 'white'
          }
      });
    }
  }

  function deinitLayer() {
    if (!map || !layerDef) return;
    if (map.getLayer(layerDef.pointLayerId)) map.removeLayer(layerDef.pointLayerId);
    if (map.getLayer(layerDef.pointSourceId)) map.removeLayer(layerDef.pointSourceId);
    const labelId = `${layerDef.pointLayerId}-labels`;
    if (map.getLayer(labelId)) map.removeLayer(labelId);
  }

  $: mapState.subscribe(({ layer }) => {
    if (!map || !map.loaded()) return;
    deinitLayer();
    initLayer(layer);
  });

  onMount(() => {
		const options: MapOptions = {
			container: mapContainer,
			style:
				'https://api.maptiler.com/maps/b946056e-74c5-4c2b-bfeb-4c580c588f62/style.json?key=eALiQdzsgc1xP3bhMxyo',
			center: [$mapState.lng, $mapState.lat],
			zoom: $mapState.zoom
		};
		map = new Map(options);
    map.on('moveend', () => {
      mapState.set({
        layer: $mapState.layer,
        lng: map.getCenter().lng,
        lat: map.getCenter().lat,
        zoom: map.getZoom()
      });
    });
    map.on('load', () => {
      initLayer($mapState.layer);
    });
  });

  onDestroy(() => {
		if (map) map.remove();
  });
</script>


<div class="flex flex-col w-full h-screen">
  <main class="flex mx-auto w-full flex-grow">
    <div class="w-full h-full" bind:this={mapContainer} />
  </main>
</div>