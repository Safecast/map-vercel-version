// Assuming ttdata.AqiLevel* constants are something like the following:
export enum AqiLevel {
  Good = 0,
  Moderate = 1,
  UnhealthyIfSensitive = 2,
  Unhealthy = 3,
  VeryUnhealthy = 4,
  Hazardous = 5,
  VeryHazardous = 6,
}

// Calculate AQI for PM2.5
// https://forum.airnowtech.org/t/the-aqi-equation/169
export function pmToAqi(concIn: number): { aqi: number; aqiLevel: number } {
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
