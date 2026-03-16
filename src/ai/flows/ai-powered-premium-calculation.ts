'use server';
/**
 * @fileOverview This file defines a Genkit flow for calculating personalized weekly insurance premiums for gig workers.
 *
 * - aiPoweredPremiumCalculation - A function that calculates the weekly insurance premium based on AI analysis.
 * - AiPoweredPremiumCalculationInput - The input type for the aiPoweredPremiumCalculation function.
 * - AiPoweredPremiumCalculationOutput - The return type for the aiPoweredPremiumCalculation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema for the premium calculation
const AiPoweredPremiumCalculationInputSchema = z.object({
  gigWorkerPersona: z
    .string()
    .describe(
      'The specific gig worker persona, e.g., "Food Delivery (Zomato)", "E-commerce (Amazon)", "Grocery (Zepto)".'
    ),
  operatingCity: z
    .string()
    .describe('The city or primary operational zone of the gig worker.'),
  historicalWeatherSummary: z
    .string()
    .describe(
      'A summary of historical weather patterns for the operating city, e.g., "Frequent heavy rain during monsoon (Jul-Sep), occasional extreme heat waves (May-Jun), rare floods."'
    ),
  historicalTrafficSummary: z
    .string()
    .describe(
      'A summary of historical traffic conditions for the operating city, e.g., "High congestion during peak hours (8-10 AM, 5-8 PM), frequent road closures for events, some areas with poor road conditions."'
    ),
  historicalDisruptionSummary: z
    .string()
    .describe(
      'A summary of historical social or environmental disruptions for the operating city, e.g., "Sporadic local strikes in specific districts, occasional curfews during festivals, no major natural disasters in recent years."'
    ),
});

export type AiPoweredPremiumCalculationInput = z.infer<
  typeof AiPoweredPremiumCalculationInputSchema
>;

// Output Schema for the premium calculation
const AiPoweredPremiumCalculationOutputSchema = z.object({
  weeklyPremiumAmountINR: z
    .number()
    .describe(
      'The calculated weekly insurance premium amount in Indian Rupees (INR), as a floating point number.'
    ),
  riskFactorsConsidered: z
    .array(z.string())
    .describe('A list of key risk factors that influenced the premium calculation.'),
  explanation: z
    .string()
    .describe(
      'A brief explanation of how the weekly premium was derived, including the rationale behind the amount.'
    ),
});

export type AiPoweredPremiumCalculationOutput = z.infer<
  typeof AiPoweredPremiumCalculationOutputSchema
>;

export async function aiPoweredPremiumCalculation(
  input: AiPoweredPremiumCalculationInput
): Promise<AiPoweredPremiumCalculationOutput> {
  return aiPoweredPremiumCalculationFlow(input);
}

const premiumCalculationPrompt = ai.definePrompt({
  name: 'premiumCalculationPrompt',
  input: {schema: AiPoweredPremiumCalculationInputSchema},
  output: {schema: AiPoweredPremiumCalculationOutputSchema},
  prompt: `You are an expert actuarial analyst specializing in parametric insurance for gig workers in India.
Your task is to calculate a fair and personalized weekly insurance premium in Indian Rupees (INR) for a gig worker based on the provided information.

Consider the following details:
- Gig Worker Persona: {{{gigWorkerPersona}}}
- Operating City: {{{operatingCity}}}
- Historical Weather Summary: {{{historicalWeatherSummary}}}
- Historical Traffic Summary: {{{historicalTrafficSummary}}}
- Historical Disruption Summary: {{{historicalDisruptionSummary}}}

Based on these factors, assess the likelihood and potential impact of income loss due to external disruptions (extreme weather, pollution, social unrest, etc.).
Calculate a weekly premium amount in INR. Provide a list of the key risk factors you considered and a brief explanation for the premium amount.
The premium should be a floating point number.`,
});

const aiPoweredPremiumCalculationFlow = ai.defineFlow(
  {
    name: 'aiPoweredPremiumCalculationFlow',
    inputSchema: AiPoweredPremiumCalculationInputSchema,
    outputSchema: AiPoweredPremiumCalculationOutputSchema,
  },
  async input => {
    const {output} = await premiumCalculationPrompt(input);
    if (!output) {
      throw new Error('Failed to generate premium calculation output.');
    }
    return output;
  }
);
