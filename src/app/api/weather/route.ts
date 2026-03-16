import { NextResponse } from 'next/server';
import { fetchAllCitiesWeather, detectParametricAlerts } from '@/lib/weather-service';

export const dynamic = 'force-dynamic'; // Don't cache this route

export async function GET() {
  try {
    const weatherData = await fetchAllCitiesWeather();
    const alerts = detectParametricAlerts(weatherData);

    return NextResponse.json({
      success: true,
      weather: weatherData,
      alerts,
      monitoredCities: weatherData.length,
      activeAlerts: alerts.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
