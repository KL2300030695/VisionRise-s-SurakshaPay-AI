'use server';
/**
 * @fileOverview A support AI agent for gig workers.
 *
 * - supportChat - A function that handles customer support queries.
 * - SupportChatInput - The input type for the supportChat function.
 * - SupportChatOutput - The return type for the supportChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import dbConnect from '@/lib/mongodb';
import GigWorker from '@/models/GigWorker';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const SupportChatInputSchema = z.object({
  message: z.string().describe('The user\'s question or message.'),
  history: z.array(MessageSchema).optional().describe('The conversation history.'),
  gigWorkerId: z.string().optional().describe('The MongoDB ObjectId of the gig worker.'),
});
export type SupportChatInput = z.infer<typeof SupportChatInputSchema>;

const SupportChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to the user.'),
});
export type SupportChatOutput = z.infer<typeof SupportChatOutputSchema>;

export async function supportChat(input: SupportChatInput): Promise<SupportChatOutput> {
  return supportChatFlow(input);
}

const baseSystemPrompt = `You are a Guidewire Parametric Assistant acting as a helpful and empathetic support agent for SurakshaPay AI, a parametric insurance platform for gig workers in India powered by Guidewire Cloud.

Your goal is to answer questions about:
1. Parametric Insurance: Explain that payouts are automatic based on external data (like rain > 10mm/hr) and don't require manual claims in most cases.
2. Weekly Premiums: Explain that policies are issued directly in Guidewire PolicyCenter and premiums are calculated weekly based on the worker's city and delivery category.
3. Payouts: Explain that when a parametric trigger is hit, the decision is routed to Guidewire ClaimCenter for zero-touch auto-adjudication, and money is sent instantly to their wallet or UPI ID.
4. Active Triggers: If they ask about current disruptions, tell them they can check the "Live Disruptions" page.

Be concise, professional, and use "Hinglish" (mix of Hindi and English) if it feels natural to be friendly, but primarily English. Always emphasize that we protect their income from external disruptions using Guidewire's powerful engine.`;

const supportChatFlow = ai.defineFlow(
  {
    name: 'supportChatFlow',
    inputSchema: SupportChatInputSchema,
    outputSchema: SupportChatOutputSchema,
  },
  async (input) => {
    let systemPrompt = baseSystemPrompt;
    
    // Fetch context from MongoDB if ID is provided
    if (input.gigWorkerId) {
      try {
        await dbConnect();
        const worker = await GigWorker.findById(input.gigWorkerId);
        if (worker) {
          systemPrompt += `\n\nUSER CONTEXT:\nYou are talking to ${worker.firstName} ${worker.lastName}. They work in the ${worker.deliveryPartnerCategory.join(', ')} category. Greet them by name.`;
        }
      } catch (error) {
        console.error("Failed to fetch worker context from MongoDB", error);
      }
    }

    const {text} = await ai.generate({
      system: systemPrompt,
      prompt: input.message,
      messages: input.history?.map(m => ({
        role: m.role,
        content: [{text: m.content}]
      })) || [],
    });

    return {
      response: text || "I'm sorry, I couldn't process that. How can I help you with your insurance today?",
    };
  }
);
