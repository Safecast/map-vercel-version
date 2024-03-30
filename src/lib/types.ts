export enum Layer {
  AIR = "air",
  RADIATION = "rad",
}

export interface AppState { }

export enum DeviceClass {
  AIRNOTE_SOLAR_AIR = "product:org.airnote.solar.air.v1",
  AIRNOTE_SOLAR_RAD = "product:org.airnote.solar.rad.v1",
  AIRNOTE_SOLAR = "product:org.airnote.solar.v1",
  BLUES_RADNOTE = "product:com.blues.radnote",
  BLUES_AIRNOTE = "product:com.blues.airnote",
  OZZIE_RADNOTE = "product:net.ozzie.ray:radnote",
  SAFECAST = "safecast",
  POINTCAST = "pointcast",
  GEIGIECAST = "geigiecast",
  NGEIGIE = "ngeigie",
  KITTYWOOD = "product:biz.yr-design.rob:kittywood",
  GNOTE = "product:com.blues.gnote",
  NODE01 = "product:org.softwarelivre.luisfelipe:node01"
}

export enum Orientation {
  FACE_UP = "face-up",
  FACE_DOWN = "face-down",
  LANDSCAPE_LEFT = "landscape-left",
  LANDSCAPE_RIGHT = "landscape-right",
  PORTRAIT_DOWN = "portrait-down",
  PORTRAIT_UP = "portrait-up",
  ANGLED = "angled",
}

export enum AqiLevel {
  Good = 0,
  Moderate = 1,
  UnhealthyIfSensitive = 2,
  Unhealthy = 3,
  VeryUnhealthy = 4,
  Hazardous = 5,
  VeryHazardous = 6,
}

export interface Device {
  device_urn: string;
  device_class: DeviceClass;
  device: number;
  device_sn: string | null;
  device_contact_name: string | null;
  device_contact_email: string | null;
  device_contact_org: string;
  device_contact_role: string;

  when_captured: Date; // "2021-08-25T00:00:00Z"

  loc_lat: number;
  loc_lon: number;
  loc_name: string;
  loc_country: string;
  loc_zone: string;

  lnd_712u: number;
  lnd_7128ec: number;
  lnd_7318c: number;
  lnd_7318u: number;
  lnd_78017w: number;

  service_uploaded: Date; // "2021-08-25T00:00:00Z"
  service_transport: string;

  dev_dashboard: string;
  dev_temp: number;
  dev_rat: string;
  dev_bars: number;
  dev_moved: Date; // "2021-08-25T00:00:00Z"
  dev_orientation: Orientation;
  dev_motion: boolean | null;
  dev_uptime: number;
  dev_transmitted_bytes: number;
  dev_received_bytes: number;
  dev_motion_events: number;
  dev_oneshots: number;
  dev_oneshot_seconds: number;
  dev_humid: number;
  dev_press: number;
  dev_comms_resets: number;
  dev_comms_power_fails: number
  dev_comms_ant_fails: number
  dev_overcurrent_events: number
  dev_test: boolean | null;
  dev_comms_failures: number;
  dev_restarts: number;
  dev_free_memory: number;
  dev_ntp_count: number;
  dev_last_failure: string;

  env_temp: number;
  env_humid: number
  env_press: number;

  bat_voltage: number;
  bat_current: number;
  bat_charge: number;

  gateway_received: Date; // "2021-08-25T00:00:00Z"
  gateway_lora_snr: number;

  pms_c00_30: number;
  pms_c00_50: number;
  pms_c01_00: number;
  pms_c02_50: number;
  pms_c05_00: number;
  pms_c10_00: number;
  pms_csecs: number;
  pms_std01_0: number;
  pms_std02_5: number;
  pms_std10_0: number;
  pms_pm01_0: number;
  pms_pm02_5: number;
  pms_pm10_0: number;

  pms2_c00_30: number;
  pms2_c00_50: number;
  pms2_c01_00: number;
  pms2_c02_50: number;
  pms2_c05_00: number;
  pms2_c10_00: number;
  pms2_csecs: number;
  pms2_pm01_0: number;
  pms2_pm02_5: number;
  pms2_pm10_0: number;

  opc_c00_38: number;
  opc_c00_54: number;
  opc_c01_00: number;
  opc_c02_10: number;
  opc_c05_00: number;
  opc_c10_00: number;
  opc_csecs: number;
  opc_pm01_0: number;
  opc_pm02_5: number;
  opc_pm10_0: number;

  opc_aqi: number;
  opc_aqiPm: number;
  opc_aqiLevel: AqiLevel;
}
