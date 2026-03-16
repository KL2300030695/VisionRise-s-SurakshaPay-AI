// Weather Service — server-side only (imported by API routes)

/**
 * Weather Service — fetches real-time weather data from Open-Meteo API
 * (Free, open-source, NO API key required)
 * Covers Indian cities relevant to SurakshaPay's parametric insurance.
 */

export interface CityWeather {
  city: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  rainMm: number;
  aqi: number | null;
  description: string;
  weatherCode: number;
  timestamp: string;
}

export interface ParametricAlert {
  city: string;
  triggerType: 'Heavy Rain' | 'Extreme Heat' | 'Poor Air Quality' | 'High Wind';
  severity: 'Medium' | 'High' | 'Critical';
  value: number;
  threshold: number;
  unit: string;
  description: string;
}

// Indian cities to monitor
const MONITORED_CITIES = [
  { name: 'Mumbai', lat: 19.076, lon: 72.8777 },
  { name: 'Delhi', lat: 28.6139, lon: 77.209 },
  { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad', lat: 17.385, lon: 78.4867 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
];

// Parametric trigger thresholds
const THRESHOLDS = {
  HEAVY_RAIN_MM: 8,
  EXTREME_HEAT_C: 42,
  POOR_AQI: 400,
  HIGH_WIND_MS: 20,
};

// WMO Weather interpretation codes → description
function weatherCodeToDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail',
  };
  return descriptions[code] || 'Unknown';
}

/**
 * Fetch current weather for a single city using Open-Meteo (free, no key)
 */
async function fetchCityWeather(city: { name: string; lat: number; lon: number }): Promise<CityWeather> {
  // Current weather from Open-Meteo
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,rain,weather_code,wind_speed_10m&timezone=Asia/Kolkata`;
  
  const res = await fetch(weatherUrl, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Open-Meteo error for ${city.name}: ${res.status}`);
  const data = await res.json();
  const current = data.current;

  // AQI from Open-Meteo Air Quality API (also free, no key)
  let aqi: number | null = null;
  try {
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=pm2_5,indian_aqi`;
    const aqiRes = await fetch(aqiUrl, { next: { revalidate: 300 } });
    if (aqiRes.ok) {
      const aqiData = await aqiRes.json();
      aqi = aqiData.current?.indian_aqi ?? null;
    }
  } catch {
    // AQI is optional
  }

  return {
    city: city.name,
    temp: Math.round(current.temperature_2m * 10) / 10,
    feelsLike: Math.round(current.apparent_temperature * 10) / 10,
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round((current.wind_speed_10m / 3.6) * 10) / 10, // km/h → m/s
    rainMm: current.rain || 0,
    aqi,
    description: weatherCodeToDescription(current.weather_code),
    weatherCode: current.weather_code,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fetch weather for all monitored cities
 */
export async function fetchAllCitiesWeather(): Promise<CityWeather[]> {
  const results = await Promise.allSettled(
    MONITORED_CITIES.map(city => fetchCityWeather(city))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<CityWeather> => r.status === 'fulfilled')
    .map(r => r.value);
}

/**
 * Detect parametric triggers from live weather data
 */
export function detectParametricAlerts(weatherData: CityWeather[]): ParametricAlert[] {
  const alerts: ParametricAlert[] = [];

  for (const w of weatherData) {
    if (w.rainMm > THRESHOLDS.HEAVY_RAIN_MM) {
      alerts.push({
        city: w.city,
        triggerType: 'Heavy Rain',
        severity: w.rainMm > 15 ? 'Critical' : 'High',
        value: w.rainMm,
        threshold: THRESHOLDS.HEAVY_RAIN_MM,
        unit: 'mm/hr',
        description: `Rainfall of ${w.rainMm}mm/hr detected in ${w.city}. Threshold: >${THRESHOLDS.HEAVY_RAIN_MM}mm/hr.`,
      });
    }

    if (w.temp > THRESHOLDS.EXTREME_HEAT_C) {
      alerts.push({
        city: w.city,
        triggerType: 'Extreme Heat',
        severity: w.temp > 45 ? 'Critical' : 'High',
        value: w.temp,
        threshold: THRESHOLDS.EXTREME_HEAT_C,
        unit: '°C',
        description: `Temperature of ${w.temp}°C recorded in ${w.city}. Threshold: >${THRESHOLDS.EXTREME_HEAT_C}°C.`,
      });
    }

    if (w.aqi && w.aqi > THRESHOLDS.POOR_AQI) {
      alerts.push({
        city: w.city,
        triggerType: 'Poor Air Quality',
        severity: w.aqi > 500 ? 'Critical' : 'High',
        value: w.aqi,
        threshold: THRESHOLDS.POOR_AQI,
        unit: 'AQI',
        description: `Indian AQI of ${w.aqi} in ${w.city}. Threshold: >${THRESHOLDS.POOR_AQI}.`,
      });
    }

    if (w.windSpeed > THRESHOLDS.HIGH_WIND_MS) {
      alerts.push({
        city: w.city,
        triggerType: 'High Wind',
        severity: w.windSpeed > 25 ? 'Critical' : 'High',
        value: w.windSpeed,
        threshold: THRESHOLDS.HIGH_WIND_MS,
        unit: 'm/s',
        description: `Wind speed of ${w.windSpeed}m/s in ${w.city}. Threshold: >${THRESHOLDS.HIGH_WIND_MS}m/s.`,
      });
    }
  }

  return alerts;
}

export { MONITORED_CITIES, THRESHOLDS };
