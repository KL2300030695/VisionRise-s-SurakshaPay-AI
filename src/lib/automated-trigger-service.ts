'use server';

/**
 * Automated Trigger Service
 * 
 * Polls 5 disruption sources (3 real APIs + 2 mock APIs) and automatically
 * creates claims for affected workers. This is the core "zero-touch" engine.
 * 
 * Triggers:
 * 1. Heavy Rainfall (Open-Meteo Live)
 * 2. Extreme Heat (Open-Meteo Live)
 * 3. Poor Air Quality (Open-Meteo AQI)
 * 4. Flood/Waterlogging (Mock IMD API)
 * 5. Urban Curfew/Bandh (Mock Civil Alert API)
 */

import { fetchAllCitiesWeather, detectParametricAlerts, type CityWeather, type ParametricAlert } from './weather-service';
import { fetchIMDFloodAlerts, fetchCivilDisruptionAlerts, type IMDFloodAlert, type CivilDisruptionAlert } from './mock-apis';
import { FirestoreService } from './firestore-service';
import { where, Timestamp } from 'firebase/firestore';
import { generateUpiIntent } from './upi-utils';

// ---- Types ----

export type TriggerSource = 'Open-Meteo Weather' | 'Open-Meteo AQI' | 'IMD Flood Alert' | 'Civil Alert API';

export interface TriggerEvent {
  id: string;
  triggerType: string;
  source: TriggerSource;
  city: string;
  severity: 'Medium' | 'High' | 'Critical';
  value: string;
  threshold: string;
  description: string;
  timestamp: string;
  affectedWorkers: number;
  claimsCreated: number;
  totalPayoutINR: number;
  status: 'Detected' | 'Processing' | 'Claims Created' | 'Payouts Sent';
}

export interface AutoScanResult {
  scanId: string;
  timestamp: string;
  triggersDetected: TriggerEvent[];
  totalClaimsCreated: number;
  totalPayoutsINR: number;
  citiesScanned: number;
  sourcesPolled: string[];
  duration: string;
}

// ---- Core Auto-Scan Logic ----

export async function runAutoTriggerScan(): Promise<AutoScanResult> {
  const startTime = Date.now();
  const scanId = `SCAN-${Date.now().toString(36).toUpperCase()}`;
  const triggers: TriggerEvent[] = [];
  let totalClaimsCreated = 0;
  let totalPayoutsINR = 0;

  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata'];

  // ---- Source 1-3: Open-Meteo Weather + AQI ----
  try {
    const weatherData = await fetchAllCitiesWeather();
    const alerts = detectParametricAlerts(weatherData);

    for (const alert of alerts) {
      const result = await processWeatherTrigger(alert);
      triggers.push({
        id: `TRG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5)}`,
        triggerType: alert.triggerType,
        source: alert.triggerType === 'Poor Air Quality' ? 'Open-Meteo AQI' : 'Open-Meteo Weather',
        city: alert.city,
        severity: alert.severity,
        value: `${alert.value} ${alert.unit}`,
        threshold: `${alert.threshold} ${alert.unit}`,
        description: alert.description,
        timestamp: new Date().toISOString(),
        affectedWorkers: result.affectedWorkers,
        claimsCreated: result.claimsCreated,
        totalPayoutINR: result.totalPayout,
        status: 'Payouts Sent',
      });
      totalClaimsCreated += result.claimsCreated;
      totalPayoutsINR += result.totalPayout;
    }
  } catch (err) {
    console.error('[AutoScan] Weather scan error:', err);
  }

  // ---- Source 4: IMD Flood Alerts ----
  for (const city of cities) {
    try {
      const floodAlerts = await fetchIMDFloodAlerts(city);
      for (const alert of floodAlerts) {
        if (alert.level === 'Orange' || alert.level === 'Red') {
          const result = await processFloodTrigger(alert);
          triggers.push({
            id: `TRG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5)}`,
            triggerType: `${alert.type} Alert (${alert.level})`,
            source: 'IMD Flood Alert',
            city: alert.city,
            severity: alert.level === 'Red' ? 'Critical' : 'High',
            value: `${alert.expectedRainfallMm}mm expected`,
            threshold: 'Orange/Red alert level',
            description: alert.description,
            timestamp: alert.issuedAt,
            affectedWorkers: result.affectedWorkers,
            claimsCreated: result.claimsCreated,
            totalPayoutINR: result.totalPayout,
            status: 'Payouts Sent',
          });
          totalClaimsCreated += result.claimsCreated;
          totalPayoutsINR += result.totalPayout;
        }
      }
    } catch (err) {
      console.error(`[AutoScan] IMD scan error for ${city}:`, err);
    }
  }

  // ---- Source 5: Civil Disruption Alerts ----
  for (const city of cities) {
    try {
      const civilAlerts = await fetchCivilDisruptionAlerts(city);
      for (const alert of civilAlerts) {
        if (alert.severity === 'High' || alert.severity === 'Critical') {
          const result = await processCivilTrigger(alert);
          triggers.push({
            id: `TRG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5)}`,
            triggerType: `${alert.type} (${alert.severity})`,
            source: 'Civil Alert API',
            city: alert.city,
            severity: alert.severity === 'Critical' ? 'Critical' : 'High',
            value: `${alert.estimatedDurationHours}h disruption`,
            threshold: 'High/Critical severity',
            description: alert.description,
            timestamp: alert.issuedAt,
            affectedWorkers: result.affectedWorkers,
            claimsCreated: result.claimsCreated,
            totalPayoutINR: result.totalPayout,
            status: 'Payouts Sent',
          });
          totalClaimsCreated += result.claimsCreated;
          totalPayoutsINR += result.totalPayout;
        }
      }
    } catch (err) {
      console.error(`[AutoScan] Civil scan error for ${city}:`, err);
    }
  }

  const endTime = Date.now();

  return {
    scanId,
    timestamp: new Date().toISOString(),
    triggersDetected: triggers,
    totalClaimsCreated,
    totalPayoutsINR,
    citiesScanned: cities.length,
    sourcesPolled: ['Open-Meteo Weather', 'Open-Meteo AQI', 'IMD Flood Alert', 'Civil Alert API'],
    duration: `${((endTime - startTime) / 1000).toFixed(1)}s`,
  };
}

// ---- Trigger Processors ----

async function processWeatherTrigger(alert: ParametricAlert): Promise<{ affectedWorkers: number; claimsCreated: number; totalPayout: number }> {
  return processGenericTrigger(
    alert.city,
    'Environmental',
    alert.triggerType,
    alert.severity,
    alert.description,
    'Open-Meteo Live API'
  );
}

async function processFloodTrigger(alert: IMDFloodAlert): Promise<{ affectedWorkers: number; claimsCreated: number; totalPayout: number }> {
  const severity = alert.level === 'Red' ? 'Critical' : 'High';
  return processGenericTrigger(
    alert.city,
    'Natural Disaster',
    alert.type,
    severity,
    alert.description,
    'IMD Flood API'
  );
}

async function processCivilTrigger(alert: CivilDisruptionAlert): Promise<{ affectedWorkers: number; claimsCreated: number; totalPayout: number }> {
  return processGenericTrigger(
    alert.city,
    'Civil Disruption',
    alert.type,
    alert.severity === 'Critical' ? 'Critical' : alert.severity === 'High' ? 'High' : 'Medium',
    alert.description,
    'Civil Alert API'
  );
}

async function processGenericTrigger(
  city: string,
  type: string,
  subType: string,
  severity: 'Medium' | 'High' | 'Critical',
  description: string,
  source: string
): Promise<{ affectedWorkers: number; claimsCreated: number; totalPayout: number }> {
  let claimsCreated = 0;
  let totalPayout = 0;

  try {
    // 1. Find the location for this city
    const location = await FirestoreService.findOne<any>('locations', [where('city', '==', city)]);
    if (!location) {
      return { affectedWorkers: 0, claimsCreated: 0, totalPayout: 0 };
    }

    // 2. Record the disruption event
    const disruptionEvent = await FirestoreService.addDocument<any>('disruptions', {
      type: [type],
      subType,
      severity: [severity],
      description,
      startDate: Timestamp.now(),
      affectedLocationIds: [location.id],
      source,
      isVerified: true,
    });

    // 3. Find active policies in that location
    const activePolicies = await FirestoreService.findMany<any>('policies', [
      where('status', '==', 'Active'),
      where('coveredLocationId', '==', location.id),
    ]);

    const payoutAmount = severity === 'Critical' ? 750 : severity === 'High' ? 500 : 350;

    for (const policy of activePolicies) {
      try {
        // 4. Create claim
        const claim = await FirestoreService.addDocument<any>('claims', {
          gigWorkerId: policy.gigWorkerId,
          policyId: policy.id,
          disruptionEventId: disruptionEvent.id,
          claimDate: Timestamp.now(),
          status: 'Paid',
          claimedLostIncomeAmount: payoutAmount,
          approvedPayoutAmount: payoutAmount,
          isAutomated: true,
          triggerSource: source,
          triggerType: subType,
          lastUpdatedDate: Timestamp.now(),
        });

        // 5. Generate UPI payout link
        const worker = await FirestoreService.getDocument<any>('workers', policy.gigWorkerId);
        if (worker) {
          const upiId = worker.upiId || 'NOT_SET';
          const workerName = `${worker.firstName} ${worker.lastName}`;
          const upiUrl = generateUpiIntent(upiId, workerName, payoutAmount);

          await FirestoreService.updateDocument('claims', claim.id, {
            upiPayoutUrl: upiUrl,
            status: 'Paid',
          });
        }

        claimsCreated++;
        totalPayout += payoutAmount;
      } catch (claimErr) {
        console.error(`[AutoScan] Claim creation error for policy ${policy.id}:`, claimErr);
      }
    }

    return { affectedWorkers: activePolicies.length, claimsCreated, totalPayout };
  } catch (err) {
    console.error(`[AutoScan] Generic trigger processing error:`, err);
    return { affectedWorkers: 0, claimsCreated: 0, totalPayout: 0 };
  }
}
