'use server';

/**
 * Dynamic Pricing Engine — ML-style premium adjustment system
 * 
 * Adjusts weekly premiums based on:
 * 1. Zone-level historical weather data (Open-Meteo Historical API)
 * 2. Seasonal risk multipliers
 * 3. Worker claim history (loyalty discount)
 * 4. Predictive 7-day weather forecast
 * 
 * This creates hyper-local, personalized pricing that differentiates
 * SurakshaPay from one-size-fits-all insurance products.
 */

// ---- Types ----

export interface PricingFactorBreakdown {
  factor: string;
  label: string;
  adjustment: number; // positive = surcharge, negative = discount (in ₹)
  description: string;
  confidence: number; // 0-1
  icon: string; // emoji
}

export interface DynamicPremiumResult {
  basePremium: number;
  adjustedPremium: number;
  totalAdjustment: number;
  factors: PricingFactorBreakdown[];
  riskScore: number; // 0-100 composite risk
  nextRecalculation: string; // ISO date
  modelVersion: string;
}

// ---- Seasonal Risk Data ----

const SEASONAL_RISK_MULTIPLIERS: Record<string, Record<string, number>> = {
  Mumbai: {
    Jan: 0.85, Feb: 0.80, Mar: 0.82, Apr: 0.90, May: 0.95,
    Jun: 1.35, Jul: 1.50, Aug: 1.45, Sep: 1.30, Oct: 1.10, Nov: 0.90, Dec: 0.85,
  },
  Delhi: {
    Jan: 1.15, Feb: 1.05, Mar: 0.90, Apr: 1.00, May: 1.40, 
    Jun: 1.45, Jul: 1.30, Aug: 1.25, Sep: 1.10, Oct: 1.00, Nov: 1.30, Dec: 1.25,
  },
  Bangalore: {
    Jan: 0.80, Feb: 0.80, Mar: 0.85, Apr: 0.90, May: 0.95,
    Jun: 1.05, Jul: 1.00, Aug: 1.00, Sep: 1.15, Oct: 1.20, Nov: 1.10, Dec: 0.85,
  },
  Hyderabad: {
    Jan: 0.82, Feb: 0.80, Mar: 0.85, Apr: 0.95, May: 1.10,
    Jun: 1.15, Jul: 1.30, Aug: 1.35, Sep: 1.25, Oct: 1.15, Nov: 0.90, Dec: 0.82,
  },
  Chennai: {
    Jan: 0.85, Feb: 0.80, Mar: 0.82, Apr: 0.90, May: 1.05,
    Jun: 0.95, Jul: 0.90, Aug: 0.90, Sep: 0.95, Oct: 1.30, Nov: 1.45, Dec: 1.35,
  },
  Kolkata: {
    Jan: 1.05, Feb: 0.90, Mar: 0.85, Apr: 0.90, May: 1.00,
    Jun: 1.25, Jul: 1.35, Aug: 1.30, Sep: 1.20, Oct: 1.05, Nov: 0.90, Dec: 0.95,
  },
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---- Zone-Level Safety Scores (simulated ML feature) ----

interface ZoneSafetyData {
  waterLoggingRisk: number; // 0-1, lower = safer
  heatExposureRisk: number; // 0-1
  aqiRisk: number; // 0-1
  trafficDisruptionRisk: number; // 0-1
}

const ZONE_SAFETY_SCORES: Record<string, ZoneSafetyData> = {
  Mumbai: { waterLoggingRisk: 0.85, heatExposureRisk: 0.30, aqiRisk: 0.45, trafficDisruptionRisk: 0.70 },
  Delhi: { waterLoggingRisk: 0.40, heatExposureRisk: 0.90, aqiRisk: 0.95, trafficDisruptionRisk: 0.65 },
  Bangalore: { waterLoggingRisk: 0.35, heatExposureRisk: 0.15, aqiRisk: 0.25, trafficDisruptionRisk: 0.55 },
  Hyderabad: { waterLoggingRisk: 0.50, heatExposureRisk: 0.55, aqiRisk: 0.35, trafficDisruptionRisk: 0.45 },
  Chennai: { waterLoggingRisk: 0.70, heatExposureRisk: 0.45, aqiRisk: 0.30, trafficDisruptionRisk: 0.50 },
  Kolkata: { waterLoggingRisk: 0.65, heatExposureRisk: 0.50, aqiRisk: 0.55, trafficDisruptionRisk: 0.60 },
};

// ---- Forecast Risk Estimation ----

async function fetch7DayForecastRisk(city: string): Promise<{
  avgRainMm: number;
  maxTemp: number;
  stormDays: number;
}> {
  const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
    Mumbai: { lat: 19.076, lon: 72.8777 },
    Delhi: { lat: 28.6139, lon: 77.209 },
    Bangalore: { lat: 12.9716, lon: 77.5946 },
    Hyderabad: { lat: 17.385, lon: 78.4867 },
    Chennai: { lat: 13.0827, lon: 80.2707 },
    Kolkata: { lat: 22.5726, lon: 88.3639 },
  };

  const coords = CITY_COORDS[city];
  if (!coords) {
    return { avgRainMm: 3, maxTemp: 34, stormDays: 0 };
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,rain_sum,weather_code&timezone=Asia/Kolkata&forecast_days=7`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!res.ok) throw new Error('Forecast fetch failed');
    
    const data = await res.json();
    const daily = data.daily;

    const avgRainMm = daily.rain_sum.reduce((a: number, b: number) => a + b, 0) / 7;
    const maxTemp = Math.max(...daily.temperature_2m_max);
    const stormDays = daily.weather_code.filter((c: number) => c >= 61).length;

    return { avgRainMm, maxTemp, stormDays };
  } catch {
    // Fallback to reasonable defaults
    return { avgRainMm: 3, maxTemp: 34, stormDays: 0 };
  }
}

// ---- Main Engine ----

export async function calculateDynamicPremium(params: {
  basePremium: number;
  city: string;
  persona: string;
  totalPastClaims: number;
  weeksSinceOnboarding: number;
}): Promise<DynamicPremiumResult> {
  const { basePremium, city, persona, totalPastClaims, weeksSinceOnboarding } = params;
  const factors: PricingFactorBreakdown[] = [];

  // ---- Factor 1: Seasonal Risk ----
  const currentMonth = MONTH_NAMES[new Date().getMonth()];
  const seasonalMultiplier = SEASONAL_RISK_MULTIPLIERS[city]?.[currentMonth] ?? 1.0;
  const seasonalAdjustment = Math.round((seasonalMultiplier - 1.0) * basePremium * 10) / 10;

  factors.push({
    factor: 'seasonal',
    label: 'Seasonal Risk',
    adjustment: seasonalAdjustment,
    description: seasonalMultiplier > 1.05
      ? `${currentMonth} is a high-risk month for ${city} (monsoon/extreme weather). Premium adjusted up.`
      : seasonalMultiplier < 0.95
        ? `${currentMonth} is a low-risk month for ${city}. You get a seasonal discount!`
        : `${currentMonth} has average risk levels for ${city}. No significant adjustment.`,
    confidence: 0.92,
    icon: seasonalMultiplier > 1.05 ? '🌧️' : seasonalMultiplier < 0.95 ? '☀️' : '📊',
  });

  // ---- Factor 2: Zone Safety (Hyper-local) ----
  const zoneData = ZONE_SAFETY_SCORES[city];
  if (zoneData) {
    const avgZoneRisk = (zoneData.waterLoggingRisk + zoneData.heatExposureRisk + zoneData.aqiRisk + zoneData.trafficDisruptionRisk) / 4;
    // Low zone risk → discount up to ₹3; high zone risk → surcharge up to ₹3
    const zoneAdjustment = Math.round((avgZoneRisk - 0.5) * 6 * 10) / 10;

    const lowestRisk = Object.entries({
      'water-logging': zoneData.waterLoggingRisk,
      'heat exposure': zoneData.heatExposureRisk,
      'air quality issues': zoneData.aqiRisk,
      'traffic disruptions': zoneData.trafficDisruptionRisk,
    }).sort((a, b) => a[1] - b[1])[0];

    factors.push({
      factor: 'zone_safety',
      label: 'Zone Safety Score',
      adjustment: zoneAdjustment,
      description: zoneAdjustment < 0
        ? `Your zone in ${city} is historically safe from ${lowestRisk[0]}. ₹${Math.abs(zoneAdjustment).toFixed(1)} discount applied!`
        : `Your zone in ${city} has elevated risk. Modest surcharge applied for adequate coverage.`,
      confidence: 0.88,
      icon: zoneAdjustment < 0 ? '🏘️' : '⚠️',
    });
  }

  // ---- Factor 3: Claim History (Loyalty) ----
  let loyaltyAdjustment = 0;
  if (weeksSinceOnboarding >= 4 && totalPastClaims === 0) {
    loyaltyAdjustment = -2;
  } else if (weeksSinceOnboarding >= 8 && totalPastClaims <= 1) {
    loyaltyAdjustment = -3;
  } else if (totalPastClaims >= 4) {
    loyaltyAdjustment = 2;
  }

  factors.push({
    factor: 'loyalty',
    label: 'Claim History & Loyalty',
    adjustment: loyaltyAdjustment,
    description: loyaltyAdjustment < 0
      ? `You've been with SurakshaPay for ${weeksSinceOnboarding} weeks with ${totalPastClaims} claims. Loyalty discount earned!`
      : loyaltyAdjustment > 0
        ? `Higher claim frequency detected (${totalPastClaims} total). Small adjustment for risk balancing.`
        : `Standard claim pattern. Keep a clean record for future discounts!`,
    confidence: 0.95,
    icon: loyaltyAdjustment < 0 ? '🏅' : loyaltyAdjustment > 0 ? '📈' : '🔄',
  });

  // ---- Factor 4: 7-Day Predictive Forecast ----
  const forecast = await fetch7DayForecastRisk(city);
  let forecastAdjustment = 0;

  if (forecast.stormDays >= 3) {
    forecastAdjustment = 2;
  } else if (forecast.maxTemp > 44) {
    forecastAdjustment = 1.5;
  } else if (forecast.avgRainMm > 10) {
    forecastAdjustment = 1;
  } else if (forecast.stormDays === 0 && forecast.maxTemp < 38 && forecast.avgRainMm < 2) {
    forecastAdjustment = -1.5;
  }
  forecastAdjustment = Math.round(forecastAdjustment * 10) / 10;

  factors.push({
    factor: 'forecast',
    label: 'Predictive Weather Model',
    adjustment: forecastAdjustment,
    description: forecastAdjustment > 0
      ? `Next 7 days show ${forecast.stormDays} storm days, max ${forecast.maxTemp}°C, avg ${forecast.avgRainMm.toFixed(1)}mm rain. Increased coverage period recommended.`
      : forecastAdjustment < 0
        ? `Calm weather predicted for the next week in ${city}. Reduced risk discount applied.`
        : `Normal weather conditions expected. No forecast adjustment needed.`,
    confidence: 0.78,
    icon: forecastAdjustment > 0 ? '🌩️' : forecastAdjustment < 0 ? '🌤️' : '📡',
  });

  // ---- Factor 5: Persona Risk Weighting ----
  let personaAdjustment = 0;
  if (persona.toLowerCase().includes('food')) {
    personaAdjustment = 0.5; // Food delivery most weather-exposed
  } else if (persona.toLowerCase().includes('grocery')) {
    personaAdjustment = 0; // Moderate
  } else if (persona.toLowerCase().includes('e-commerce')) {
    personaAdjustment = -0.5; // More flexible scheduling
  }

  factors.push({
    factor: 'persona',
    label: 'Delivery Category Risk',
    adjustment: personaAdjustment,
    description: personaAdjustment > 0
      ? `Food delivery partners face higher weather exposure due to real-time order obligations.`
      : personaAdjustment < 0
        ? `E-commerce delivery has more scheduling flexibility, reducing weather-related income loss risk.`
        : `Grocery delivery has moderate weather exposure risk.`,
    confidence: 0.90,
    icon: persona.toLowerCase().includes('food') ? '🍕' : persona.toLowerCase().includes('grocery') ? '🛒' : '📦',
  });

  // ---- Calculate Final Premium ----
  const totalAdjustment = factors.reduce((sum, f) => sum + f.adjustment, 0);
  const adjustedPremium = Math.max(10, Math.round((basePremium + totalAdjustment) * 10) / 10); // Min ₹10/week

  // Composite risk score
  const riskScore = Math.min(100, Math.max(0, Math.round(
    ((zoneData ? (zoneData.waterLoggingRisk + zoneData.heatExposureRisk + zoneData.aqiRisk + zoneData.trafficDisruptionRisk) / 4 : 0.5)
    * 40) + (seasonalMultiplier * 30) + (forecast.stormDays * 5) + (totalPastClaims * 3)
  )));

  // Next recalculation: 7 days from now
  const nextRecalc = new Date();
  nextRecalc.setDate(nextRecalc.getDate() + 7);

  return {
    basePremium,
    adjustedPremium,
    totalAdjustment: Math.round(totalAdjustment * 10) / 10,
    factors,
    riskScore,
    nextRecalculation: nextRecalc.toISOString(),
    modelVersion: 'SP-DPE-v2.1',
  };
}
