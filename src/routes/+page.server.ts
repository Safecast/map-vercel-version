import type { PageServerLoad } from './$types';
import type { Device } from '$lib/types';
import { DeviceClass, Orientation } from '$lib/types';
import { pmToAqi } from '$lib/aqi';

// const url = 'https://tt.safecast.org/devices?template={"device_urn":"","loc_name":"","loc_country":"","device_sn":"","device_contact_name":"","device_contact_email":"","device":0,"when_captured":"","env_temp":0.0,"env_humid":0.0,"env_press":0.0,"bat_voltage":0.0,"lnd_7318c":0.0,"pms_pm02_5":0.0,"pms_aqi":0.0,"dev_temp":0.0,"dev_orientation":"","dev_dashboard":""}';
const url = "https://tt.safecast.org/devices";

function parseDevice(d: any): Device {
  const { aqi, aqiLevel } = pmToAqi(d.pms_pm02_5);
  return {
    ...d,
    device_class: d.device_class as DeviceClass,
    dev_orientation: d.dev_orientation as Orientation,
    when_captured: new Date(d.when_captured),
    service_uploaded_org: d.service_uploaded,
    service_uploaded: new Date(d.service_uploaded),
    dev_moved: new Date(d.dev_moved),
    gateway_received_org: d.gateway_received,
    gateway_received: new Date(d.gateway_received),
    aqi,
    aqiLevel,
  }
}

function includeDevice(device: Device): boolean {
  if (device.loc_lon == null || device.loc_lat == null) return false;
  return device.device_class === DeviceClass.AIRNOTE_SOLAR ||
    device.device_class === DeviceClass.AIRNOTE_SOLAR_AIR ||
    device.device_class === DeviceClass.AIRNOTE_SOLAR_RAD;
  // device.device_class === DeviceClass.BLUES_RADNOTE ||
  // device.device_class === DeviceClass.OZZIE_RADNOTE ||
  // device.device_class === DeviceClass.GNOTE ||
  // device.device_class === DeviceClass.KITTYWOOD;
}

function createAQIGeoJSON(devices: Device[]): object {
  return {
    type: 'FeatureCollection',
    "name": "safecast-aqi",
    "crs": {
      "type": "name",
      "properties": {
        "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
      }
    },
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
        aqi: device.aqi,
        aqiLevel: device.aqiLevel,
      },
    })),
  };
}

export const load: PageServerLoad = async ({ params }) => {
  const response = await fetch(url);
  const data = await response.json();
  const devices = data.map(parseDevice).filter(includeDevice);
  const aqiLayer = createAQIGeoJSON(devices);
  return { devices, aqiLayer };
};
