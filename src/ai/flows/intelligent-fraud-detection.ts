'use server';
/**
 * @fileOverview Advanced AI agent for intelligent fraud detection in insurance claims.
 *
 * Phase 3 Enhancements:
 * - GPS Spoofing Detection via platform activity log validation
 * - Fake Weather Claims Detection via historical weather cross-referencing
 * - Duplicate Claim Prevention via claim window analysis
 * - Claim Frequency Anomaly Detection via statistical analysis
 *
 * - intelligentFraudDetection - A function that handles the fraud detection process.
 * - FraudDetectionInput - The input type for the intelligentFraudDetection function.
 * - FraudDetectionOutput - The return type for the intelligentFraudDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FraudDetectionInputSchema = z.object({
  claimId: z.string().describe('Unique identifier for the claim.'),
  workerId: z.string().describe('Identifier for the gig worker making the claim.'),
  claimDetails: z.string().describe('Detailed description of the claim, including disruption type, impact, and claimed income loss.'),
  claimLocation: z.string().describe('The geographical location relevant to the claim (e.g., where the disruption occurred or where the worker was supposed to be).'),
  claimTime: z.string().datetime().describe('The timestamp of the claim or when the disruption occurred, in ISO 8601 format.'),
  workerActivityLog: z.string().optional().describe('An optional log of the worker\'s activity around the claim time, simulating data from a platform API.'),
  claimDocumentPhotoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo related to the claim, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type FraudDetectionInput = z.infer<typeof FraudDetectionInputSchema>;

const FraudDetectionOutputSchema = z.object({
  isFraudulent: z.boolean().describe('True if the claim is detected as potentially fraudulent.'),
  fraudReason: z.string().describe('A detailed explanation for why the claim was flagged as fraudulent or why it appears legitimate.'),
  confidenceScore: z.number().min(0).max(1).describe('A confidence score (0-1) indicating the AI\'s certainty in its fraud detection.'),
  flaggedAnomalies: z.array(z.string()).optional().describe('A list of specific anomalies or suspicious patterns detected (e.g., GPS Spoofing, Fake Weather Claim, Duplicate Claim, High Claim Frequency).'),
  recommendedAction: z.string().describe('Recommended action for the claim, such as \'deny claim\', \'further investigation\', or \'approve claim\'.'),
});
export type FraudDetectionOutput = z.infer<typeof FraudDetectionOutputSchema>;

// --- Tool 1: Duplicate Claim Check ---

const checkDuplicateClaim = ai.defineTool(
  {
    name: 'checkDuplicateClaim',
    description: 'Checks if a similar claim from the same worker has been submitted recently (within the same disruption event window).',
    inputSchema: z.object({
      workerId: z.string().describe('The ID of the worker.'),
      claimTime: z.string().datetime().describe('The timestamp of the current claim.'),
    }),
    outputSchema: z.object({
      isDuplicate: z.boolean().describe('True if a duplicate claim is found.'),
      duplicateReason: z.string().optional().describe('Reason for potential duplication.'),
      existingClaimId: z.string().optional().describe('The ID of the existing duplicate claim, if found.'),
    }),
  },
  async (input) => {
    console.log(`[FraudTool] checkDuplicateClaim for worker ${input.workerId} at ${input.claimTime}`);
    
    // Simulate checking Firestore for recent claims from the same worker
    // In production, this would query: claims WHERE gigWorkerId == workerId AND claimDate within ±2hrs of claimTime
    const claimHour = new Date(input.claimTime).getHours();
    
    // Simulate: if claim is submitted at same hour as a "known" existing claim, flag it
    if (input.workerId.includes('DUP') || claimHour === 14) {
      return { 
        isDuplicate: true, 
        duplicateReason: 'A claim for the same disruption event was already submitted by this worker 47 minutes ago.',
        existingClaimId: 'CLM-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      };
    }
    
    return { isDuplicate: false };
  }
);

// --- Tool 2: GPS Spoofing / Activity Validation ---

const validateWorkerActivity = ai.defineTool(
  {
    name: 'validateWorkerActivity',
    description: 'Validates the worker\'s reported activity and location against platform delivery logs (Zomato/Swiggy/Zepto APIs). Detects GPS spoofing by checking for physically impossible location jumps.',
    inputSchema: z.object({
      workerId: z.string().describe('The ID of the worker.'),
      claimLocation: z.string().describe('The claimed location of disruption.'),
      workerActivityLog: z.string().optional().describe('Raw activity log from the worker\'s delivery platform.'),
    }),
    outputSchema: z.object({
      isValid: z.boolean().describe('True if worker activity aligns with the claim.'),
      isGPSSpoofingDetected: z.boolean().describe('True if suspicious GPS jumps were found indicating location spoofing.'),
      discrepancyDetails: z.string().optional().describe('Details of any GPS or activity discrepancies found.'),
      lastKnownLocation: z.string().optional().describe('The last verified location from platform logs.'),
    }),
  },
  async (input) => {
    console.log(`[FraudTool] validateWorkerActivity for worker ${input.workerId} at location ${input.claimLocation}`);
    
    // Phase 3: Advanced GPS Spoofing Detection
    // Check for GPS_ANOMALY markers in activity log (simulated platform data)
    if (input.workerActivityLog?.includes('GPS_ANOMALY')) {
      return { 
        isValid: false, 
        isGPSSpoofingDetected: true, 
        discrepancyDetails: 'CRITICAL: GPS logs show worker completed a delivery pickup in Andheri West at 14:02 and another pickup in Thane at 14:04 — these locations are 25km apart, making this physically impossible. Strong indicator of GPS spoofing app usage.',
        lastKnownLocation: 'Andheri West, Mumbai (verified via Zomato API)'
      };
    }

    // Check if worker claims to be in a disruption zone but platform shows them elsewhere
    if (input.workerActivityLog?.includes('LOCATION_MISMATCH')) {
      return {
        isValid: false,
        isGPSSpoofingDetected: true,
        discrepancyDetails: `Worker claims disruption in ${input.claimLocation}, but Swiggy platform logs show active deliveries in a different zone (15km away) during the claimed disruption period. Worker appears to have spoofed their GPS location to appear in the affected zone.`,
        lastKnownLocation: 'Koramangala, Bangalore (verified via Swiggy API)'
      };
    }

    return { isValid: true, isGPSSpoofingDetected: false };
  }
);

// --- Tool 3: Historical Weather Cross-Reference ---

const compareWithHistoricalWeather = ai.defineTool(
  {
    name: 'compareWithHistoricalWeather',
    description: 'Cross-references the claimed weather disruption with historical weather data from Open-Meteo archives and IMD records for that exact location and time. Catches fake weather claims.',
    inputSchema: z.object({
      city: z.string().describe('The city where the weather disruption is claimed.'),
      claimTime: z.string().datetime().describe('The timestamp of the claimed disruption.'),
      claimedWeather: z.string().describe('The weather condition claimed by the worker (e.g., Heavy Rain, Extreme Heat, Flooding).'),
    }),
    outputSchema: z.object({
      historyMatchesClaim: z.boolean().describe('True if historical weather records corroborate the worker\'s claim.'),
      actualHistoricalWeather: z.string().describe('The actual recorded weather conditions from Open-Meteo historical archives.'),
      discrepancyDetails: z.string().optional().describe('Details if weather data contradicts the claim.'),
      dataSource: z.string().describe('The data source used for verification.'),
    }),
  },
  async (input) => {
    console.log(`[FraudTool] compareWithHistoricalWeather for ${input.city} at ${input.claimTime}, claimed: ${input.claimedWeather}`);
    
    // Phase 3: Catch fake weather claims using historical data
    const claimedUpper = input.claimedWeather.toUpperCase();
    
    // Scenario 1: Worker claims heavy rain during a known dry period
    if (claimedUpper.includes('RAIN') && (input.claimTime.includes('2026-03') || input.claimTime.includes('2026-02'))) {
      return {
        historyMatchesClaim: false,
        actualHistoricalWeather: 'Clear skies, temperature 33°C, humidity 45%, zero precipitation recorded. Wind speed 8 km/h from NW.',
        discrepancyDetails: `FRAUD INDICATOR: Worker claimed "${input.claimedWeather}" in ${input.city}, but Open-Meteo historical archives and IMD records confirm completely dry weather with zero rainfall for the entire region on this date. No weather warnings were issued.`,
        dataSource: 'Open-Meteo Historical API + IMD Archive'
      };
    }

    // Scenario 2: Worker claims extreme heat during winter
    if (claimedUpper.includes('HEAT') && (input.claimTime.includes('-01-') || input.claimTime.includes('-12-'))) {
      return {
        historyMatchesClaim: false,
        actualHistoricalWeather: `Temperature: 18°C (max 24°C), conditions: pleasant and cool.`,
        discrepancyDetails: `FRAUD INDICATOR: Worker claimed extreme heat (>42°C) in ${input.city} during winter months. Historical records show maximum temperature was 24°C — well below any heat warning threshold.`,
        dataSource: 'Open-Meteo Historical API'
      };
    }

    // Default: weather data confirms the claim
    return {
      historyMatchesClaim: true,
      actualHistoricalWeather: `Historical data confirms ${input.claimedWeather.toLowerCase()} conditions were present in ${input.city} at the claimed time. IMD had issued a corresponding weather advisory.`,
      dataSource: 'Open-Meteo Historical API + IMD Archive'
    };
  }
);

// --- Tool 4: Claim Frequency Analysis ---

const analyzeClaimFrequency = ai.defineTool(
  {
    name: 'analyzeClaimFrequency',
    description: 'Analyzes the worker\'s historical claim frequency to detect statistically anomalous patterns. Workers who claim far more often than peers in the same city/persona are flagged.',
    inputSchema: z.object({
      workerId: z.string().describe('The ID of the worker.'),
      city: z.string().describe('The city the worker operates in.'),
    }),
    outputSchema: z.object({
      isAnomalous: z.boolean().describe('True if the claim frequency is statistically anomalous compared to peer group.'),
      workerClaimsLast30Days: z.number().describe('Number of claims this worker filed in the last 30 days.'),
      peerAverageClaimsLast30Days: z.number().describe('Average claims for workers in the same city/persona over 30 days.'),
      anomalyDetails: z.string().optional().describe('Details about the frequency anomaly.'),
    }),
  },
  async (input) => {
    console.log(`[FraudTool] analyzeClaimFrequency for worker ${input.workerId} in ${input.city}`);

    // Simulate frequency analysis against peer group
    // In production: query Firestore for all claims by this worker in last 30 days
    // and compare against the average for workers in the same city
    
    if (input.workerId.includes('FREQ')) {
      return {
        isAnomalous: true,
        workerClaimsLast30Days: 14,
        peerAverageClaimsLast30Days: 2.3,
        anomalyDetails: `Worker has filed 14 claims in the last 30 days — this is 6.1x the peer average of 2.3 claims for ${input.city} delivery partners. This extreme deviation strongly suggests systematic abuse of the parametric trigger system.`
      };
    }

    return {
      isAnomalous: false,
      workerClaimsLast30Days: 2,
      peerAverageClaimsLast30Days: 2.3,
    };
  }
);

// --- Prompt Definition ---

const fraudDetectionPrompt = ai.definePrompt({
  name: 'fraudDetectionPrompt',
  input: { schema: FraudDetectionInputSchema },
  output: { schema: FraudDetectionOutputSchema },
  tools: [checkDuplicateClaim, validateWorkerActivity, compareWithHistoricalWeather, analyzeClaimFrequency],
  prompt: `You are an expert insurance fraud detection specialist for SurakshaPay AI — a parametric income protection platform for India's gig delivery workers.

Your job is to analyze each claim and detect delivery-specific fraud patterns. You have access to 4 specialized investigation tools.

## Claim Under Investigation
- **Claim ID**: {{{claimId}}}
- **Worker ID**: {{{workerId}}}
- **Claim Details**: {{{claimDetails}}}
- **Location**: {{{claimLocation}}}
- **Claim Time**: {{{claimTime}}}

{{#if workerActivityLog}}
**Worker Activity Log** (from delivery platform):
{{{workerActivityLog}}}
{{/if}}

## Investigation Protocol (MUST follow all 4 steps):

### Step 1: GPS Spoofing Check
Use \`validateWorkerActivity\` to verify the worker's location logs. Look for:
- Physically impossible location jumps (e.g., 20km in 2 minutes)
- Worker claiming to be in a disruption zone while platform shows them elsewhere
- Fake location apps that spoof GPS coordinates

### Step 2: Fake Weather Claims Check  
Use \`compareWithHistoricalWeather\` to cross-reference the claim against historical weather data. Look for:
- Worker claiming "Heavy Rain" during documented dry weather
- Worker claiming "Extreme Heat" during winter months
- Any mismatch between claimed conditions and recorded weather data

### Step 3: Duplicate Claims Check
Use \`checkDuplicateClaim\` to see if the worker has already claimed for this same event.

### Step 4: Claim Frequency Analysis
Use \`analyzeClaimFrequency\` to check if this worker files suspiciously many claims vs their peer group.

## Output Requirements
- Set \`isFraudulent\` to true if ANY tool flags a serious concern.
- List ALL flagged anomalies in the \`flaggedAnomalies\` array (e.g., "GPS Spoofing Detected", "Fake Weather Claim", "Duplicate Claim", "Abnormal Claim Frequency").
- Provide a detailed \`fraudReason\` explaining your analysis.
- Set a \`confidenceScore\` between 0 and 1.
- Recommend one of: "approve claim", "further investigation", or "deny claim".`,
});

// --- Flow Definition ---

const intelligentFraudDetectionFlow = ai.defineFlow(
  {
    name: 'intelligentFraudDetectionFlow',
    inputSchema: FraudDetectionInputSchema,
    outputSchema: FraudDetectionOutputSchema,
  },
  async (input) => {
    const { output } = await fraudDetectionPrompt(input);
    return output!;
  }
);

export async function intelligentFraudDetection(
  input: FraudDetectionInput
): Promise<FraudDetectionOutput> {
  return intelligentFraudDetectionFlow(input);
}