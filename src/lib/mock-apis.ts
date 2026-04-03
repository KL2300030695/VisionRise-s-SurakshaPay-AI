/**
 * Mock APIs for India-specific disruption sources
 * 
 * Simulates data from:
 * 1. India Meteorological Department (IMD) — Flood/Cyclone alerts
 * 2. Civil/Urban Disruption Authority — Bandh/Curfew alerts
 * 
 * Each mock returns realistic data based on city, season, and time.
 * Real API integration points are clearly documented.
 */

// ---- Types ----

export interface IMDFloodAlert {
  alertId: string;
  city: string;
  state: string;
  level: 'Green' | 'Yellow' | 'Orange' | 'Red';
  type: 'Flood' | 'Cyclone' | 'Cloudburst' | 'Waterlogging';
  description: string;
  issuedAt: string;
  validUntil: string;
  expectedRainfallMm: number;
  affectedAreas: string[];
  source: string;
}

export interface CivilDisruptionAlert {
  alertId: string;
  city: string;
  type: 'Bandh' | 'Curfew' | 'Protest' | 'Festival_Closure' | 'VIP_Movement';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  issuedAt: string;
  validFrom: string;
  validUntil: string;
  affectedZones: string[];
  estimatedDurationHours: number;
  source: string;
}

// ---- Season & City Data for Realistic Mocking ----

const MONSOON_MONTHS = [5, 6, 7, 8]; // Jun-Sep (0-indexed)
const CYCLONE_MONTHS = [9, 10, 11]; // Oct-Dec
const HEAT_MONTHS = [3, 4, 5]; // Apr-Jun

const CITY_FLOOD_RISK: Record<string, number> = {
  Mumbai: 0.80, Delhi: 0.35, Bangalore: 0.30,
  Hyderabad: 0.45, Chennai: 0.65, Kolkata: 0.55,
};

const CITY_CIVIL_RISK: Record<string, number> = {
  Mumbai: 0.15, Delhi: 0.30, Bangalore: 0.20,
  Hyderabad: 0.15, Chennai: 0.10, Kolkata: 0.25,
};

function generateAlertId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

// ---- Mock IMD Flood/Weather Alert API ----
// Real API: https://mausam.imd.gov.in/  (no public REST API, so we mock)

export async function fetchIMDFloodAlerts(city: string): Promise<IMDFloodAlert[]> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

  const month = new Date().getMonth();
  const floodRisk = CITY_FLOOD_RISK[city] || 0.3;
  const alerts: IMDFloodAlert[] = [];

  // Higher chance of alerts during monsoon
  const isMonsoon = MONSOON_MONTHS.includes(month);
  const isCycloneSeason = CYCLONE_MONTHS.includes(month);
  const triggerChance = isMonsoon ? floodRisk * 0.7 : isCycloneSeason ? floodRisk * 0.4 : floodRisk * 0.1;

  if (Math.random() < triggerChance) {
    const severity = Math.random();
    const level: IMDFloodAlert['level'] = severity > 0.8 ? 'Red' : severity > 0.5 ? 'Orange' : severity > 0.2 ? 'Yellow' : 'Green';
    const type: IMDFloodAlert['type'] = isCycloneSeason && Math.random() > 0.6
      ? 'Cyclone'
      : Math.random() > 0.5 ? 'Flood' : 'Waterlogging';

    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setHours(validUntil.getHours() + (level === 'Red' ? 48 : level === 'Orange' ? 24 : 12));

    alerts.push({
      alertId: generateAlertId('IMD'),
      city,
      state: getState(city),
      level,
      type,
      description: getFloodDescription(city, type, level),
      issuedAt: now.toISOString(),
      validUntil: validUntil.toISOString(),
      expectedRainfallMm: level === 'Red' ? 120 + Math.floor(Math.random() * 80) : level === 'Orange' ? 60 + Math.floor(Math.random() * 60) : 20 + Math.floor(Math.random() * 30),
      affectedAreas: getAffectedAreas(city),
      source: 'Mock IMD API (mausam.imd.gov.in)',
    });
  }

  return alerts;
}

// ---- Mock Civil Disruption Alert API ----
// Real API: No unified API exists; would aggregate from news/gov sources

export async function fetchCivilDisruptionAlerts(city: string): Promise<CivilDisruptionAlert[]> {
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 150));

  const civilRisk = CITY_CIVIL_RISK[city] || 0.15;
  const alerts: CivilDisruptionAlert[] = [];

  if (Math.random() < civilRisk) {
    const types: CivilDisruptionAlert['type'][] = ['Bandh', 'Protest', 'Festival_Closure', 'VIP_Movement'];
    const type = types[Math.floor(Math.random() * types.length)];
    const severity = type === 'Bandh' ? 'Critical' : type === 'Protest' ? 'High' : 'Medium';
    const durationHours = type === 'Bandh' ? 12 : type === 'Protest' ? 6 : 4;

    const now = new Date();
    const validFrom = new Date(now);
    validFrom.setHours(6, 0, 0, 0); // Start at 6 AM
    const validUntil = new Date(validFrom);
    validUntil.setHours(validFrom.getHours() + durationHours);

    alerts.push({
      alertId: generateAlertId('CIVIL'),
      city,
      type,
      severity,
      description: getCivilDescription(city, type),
      issuedAt: now.toISOString(),
      validFrom: validFrom.toISOString(),
      validUntil: validUntil.toISOString(),
      affectedZones: getAffectedAreas(city).slice(0, 3),
      estimatedDurationHours: durationHours,
      source: 'Mock Civil Alert API',
    });
  }

  return alerts;
}

// ---- Helper Functions ----

function getState(city: string): string {
  const states: Record<string, string> = {
    Mumbai: 'Maharashtra', Delhi: 'Delhi', Bangalore: 'Karnataka',
    Hyderabad: 'Telangana', Chennai: 'Tamil Nadu', Kolkata: 'West Bengal',
  };
  return states[city] || 'India';
}

function getFloodDescription(city: string, type: string, level: string): string {
  const descriptions: Record<string, string> = {
    'Flood-Red': `EXTREME WARNING: Severe flooding expected in ${city}. All outdoor delivery operations should halt. Expected heavy rainfall with significant waterlogging.`,
    'Flood-Orange': `WARNING: Heavy flooding likely in low-lying areas of ${city}. Delivery operations in affected zones may be disrupted.`,
    'Cyclone-Red': `CYCLONE ALERT: Cyclonic system approaching ${city} coast. Very heavy rainfall and strong winds expected. All outdoor workers advised to stay indoors.`,
    'Cyclone-Orange': `CYCLONE WATCH: Cyclonic depression near ${city}. Heavy rain and gusty winds expected in coastal areas.`,
    'Waterlogging-Orange': `WATERLOGGING ADVISORY: Major roads in ${city} experiencing severe waterlogging. Multiple routes impassable for two-wheelers.`,
    'Waterlogging-Yellow': `WATERLOGGING NOTICE: Some roads in ${city} may experience waterlogging during heavy spells. Plan alternate routes.`,
  };
  return descriptions[`${type}-${level}`] || `${type} alert for ${city}. Level: ${level}. Stay cautious.`;
}

function getCivilDescription(city: string, type: string): string {
  const descriptions: Record<string, string> = {
    Bandh: `City-wide Bandh called in ${city}. Commercial establishments and transport expected to be affected. Delivery operations may face disruptions across all zones.`,
    Protest: `Large-scale protest reported in central ${city}. Traffic diversions in place. Delivery routes through affected areas will see delays.`,
    Festival_Closure: `Major festival procession in ${city}. Road closures expected in key commercial zones. Expect delivery delays.`,
    VIP_Movement: `VIP movement in ${city}. Temporary road closures on major arterials. Minor delivery delays expected.`,
  };
  return descriptions[type] || `Civil disruption in ${city}.`;
}

function getAffectedAreas(city: string): string[] {
  const areas: Record<string, string[]> = {
    Mumbai: ['Andheri', 'Bandra', 'Dadar', 'Kurla', 'Mulund', 'Sion'],
    Delhi: ['Connaught Place', 'Karol Bagh', 'Lajpat Nagar', 'Dwarka', 'Rohini'],
    Bangalore: ['MG Road', 'Koramangala', 'Whitefield', 'Electronic City', 'Indiranagar'],
    Hyderabad: ['Hitec City', 'Secunderabad', 'Ameerpet', 'Kukatpally', 'Banjara Hills'],
    Chennai: ['T Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'Porur'],
    Kolkata: ['Salt Lake', 'Park Street', 'Howrah', 'Jadavpur', 'New Town'],
  };
  return areas[city] || ['Central', 'South', 'North'];
}
