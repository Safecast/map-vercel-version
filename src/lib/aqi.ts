import { AqiLevel, type Device } from "./types";


// Adjust humidity according to US EPA PM2.5 adjustment factor
// https://amt.copernicus.org/preprints/amt-2020-413/amt-2020-413.pdf
// https://cfpub.epa.gov/si/si_public_file_download.cfm?p_download_id=540979&Lab=CEMM
function adjustPM25ForHumidity(device: Device): number {
  let pmIn: number = device.pms_pm02_5;
  let pmOut: number = device.pms_pm02_5;

  if (device.env_humid !== undefined) {
    pmOut = (0.524 * pmIn) - (0.0852 * device.env_humid) + 5.72;
  }

  // PM goes negative at low PMs and high humidity
  if (pmOut < 0) {
    pmOut = 0;
  }

  return pmOut;
}

// Calculate AQI for PM2.5
// https://forum.airnowtech.org/t/the-aqi-equation/169
function pmToAqi(concIn: number): { aqi: number; aqiLevel: number } {
  let concLo: number, concHi: number, aqiLo: number, aqiHi: number;
  let aqiLevel: number | null = null;

  // For all AQI calculations, the calculated average concentrations are truncated to 0.1 μg/m3 for PM2.5.
  // This truncated concentration is then used as the input (ConcIn) in the AQI equation. The resulting AQI
  // is rounded to the nearest whole number.
  let itemp: number = Math.floor(concIn * 10);
  concIn = itemp / 10;

  // Calculate level
  if (aqiLevel == null) {
    concLo = 0.0;
    concHi = 12.0;
    if (concIn >= concLo && concIn <= concHi) {
      aqiLo = 0;
      aqiHi = 50;
      aqiLevel = AqiLevel.Good;
    }
  }
  if (aqiLevel == null) {
    concLo = concHi;
    concHi = 35.4;
    if (concIn >= concLo && concIn <= concHi) {
      aqiLo = 51;
      aqiHi = 100;
      aqiLevel = AqiLevel.Moderate;
    }
  }
  if (aqiLevel == null) {
    concLo = concHi;
    concHi = 55.4;
    if (concIn >= concLo && concIn <= concHi) {
      aqiLo = 101;
      aqiHi = 150;
      aqiLevel = AqiLevel.UnhealthyIfSensitive;
    }
  }
  if (aqiLevel == null) {
    concLo = concHi;
    concHi = 150.4;
    if (concIn >= concLo && concIn <= concHi) {
      aqiLo = 151;
      aqiHi = 200;
      aqiLevel = AqiLevel.Unhealthy;
    }
  }
  if (aqiLevel == null) {
    concLo = concHi;
    concHi = 250.4;
    if (concIn >= concLo && concIn <= concHi) {
      aqiLo = 201;
      aqiHi = 300;
      aqiLevel = AqiLevel.VeryUnhealthy;
    }
  }
  if (aqiLevel == null) {
    concLo = concHi;
    concHi = 500.4;
    if (concIn >= concLo && concIn <= concHi) {
      aqiLo = 301;
      aqiHi = 500;
      aqiLevel = AqiLevel.Hazardous;
    }
  }
  if (aqiLevel == null) {
    // Level is higher than the top of the table.
    aqiLevel = AqiLevel.VeryHazardous;
    return { aqi: Math.round(concIn), aqiLevel };
  } else {
    // Compute the AQI according to the equation
    return { aqi: Math.round((((aqiHi - aqiLo) / (concHi - concLo)) * (concIn - concLo)) + aqiLo), aqiLevel };
  }
}

// Calculate AQI
export function calculateAqi(device: Device) {
  // Perform calculations based on sensor type
  if (device.pms_pm02_5 !== undefined) {
    const aqiPm = adjustPM25ForHumidity(device);
    const { aqi, aqiLevel } = pmToAqi(aqiPm);
    device.opc_aqiLevel = aqiLevel;
    device.opc_aqiPm = aqiPm;
    device.opc_aqi = aqi;
  }
  return device;
  // Additional sensor types would be processed similarly...
}
