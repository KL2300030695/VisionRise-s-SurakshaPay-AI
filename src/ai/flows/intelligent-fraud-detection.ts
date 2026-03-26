'use server';
/**
 * @fileOverview An AI agent for intelligent fraud detection in insurance claims.
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
  flaggedAnomalies: z.array(z.string()).optional().describe('A list of specific anomalies or suspicious patterns detected (e.g., GPS Spoofing, Fake Weather).'),
  recommendedAction: z.string().describe('Recommended action for the claim, such as \'deny claim\', \'further investigation\', or \'approve claim\'.'),
});
export type FraudDetectionOutput = z.infer<typeof FraudDetectionOutputSchema>;

// --- Tools Definitions ---

const checkDuplicateClaim = ai.defineTool(
  {
    name: 'checkDuplicateClaim',
    description: 'Checks if a similar claim from the same worker has been submitted recently.',
    inputSchema: z.object({
      workerId: z.string().describe('The ID of the worker.'),
      claimTime: z.string().datetime().describe('The timestamp of the current claim.'),
    }),
    outputSchema: z.object({
      isDuplicate: z.boolean().describe('True if a duplicate claim is found.'),
      duplicateReason: z.string().optional().describe('Reason for potential duplication.'),
    }),
  },
  async (input) => {
    // Simulate a check against a database of past claims.
    console.log(`[Tool] checkDuplicateClaim for worker ${input.workerId}`);
    return { isDuplicate: false };
  }
);

const validateWorkerActivity = ai.defineTool(
  {
    name: 'validateWorkerActivity',
    description: 'Validates the worker\'s reported activity and location against platform logs or GPS data for the claim period.',
    inputSchema: z.object({
      workerId: z.string().describe('The ID of the worker.'),
      claimLocation: z.string().describe('The claimed location of disruption.'),
      workerActivityLog: z.string().optional().describe('Raw activity log from the worker\'s platform.'),
    }),
    outputSchema: z.object({
      isValid: z.boolean().describe('True if worker activity aligns with the claim.'),
      isGPSSpoofingDetected: z.boolean().describe('True if suspicious GPS jumps were found.'),
      discrepancyDetails: z.string().optional().describe('Details of any discrepancies found.'),
    }),
  },
  async (input) => {
    // Simulate validation against platform APIs (Zomato/Swiggy mocks).
    console.log(`[Tool] validateWorkerActivity for worker ${input.workerId}`);
    
    // Simulate detecting a GPS anomaly (Phase 3 Requirement)
    if (input.workerActivityLog?.includes('GPS_ANOMALY')) {
      return { 
        isValid: false, 
        isGPSSpoofingDetected: true, 
        discrepancyDetails: 'Suspicious location jumps detected in platform logs suggest GPS spoofing.' 
      };
    }

    return { isValid: true, isGPSSpoofingDetected: false };
  }
);

// --- Prompt Definition ---

const fraudDetectionPrompt = ai.definePrompt({
  name: 'fraudDetectionPrompt',
  input: { schema: FraudDetectionInputSchema },
  output: { schema: FraudDetectionOutputSchema },
  tools: [checkDuplicateClaim, validateWorkerActivity],
  prompt: `You are an expert insurance fraud detection specialist for SurakshaPay AI. Analyze this parametric claim.
  
Claim ID: {{{claimId}}}
Worker ID: {{{workerId}}}
Details (Stimulation Query): {{{claimDetails}}}
Location: {{{claimLocation}}}

{{#if workerActivityLog}}
Worker Activity Log: {{{workerActivityLog}}}
{{/if}}

Check for:
1. GPS Spoofing: Use validateWorkerActivity to see if location logs are inconsistent.
2. Duplicate Claims: Use checkDuplicateClaim to see if they've claimed for this same event twice.
3. Context: Does the claim time match the disruption event?
4. Plausibility (Stimulation): If this is a "stimulation" query (a reported problem by the worker), is it plausible for the location? 
   - Rains/Heat waves: Are they meteorologically possible for that city/season?
   - Curfews: Are there any known civil disruptions in that area?
   - If the claim is clearly impossible (e.g., snow in a tropical city in summer), flag it as fraudulent.

Provide a detailed fraudReason and confidenceScore.`,
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