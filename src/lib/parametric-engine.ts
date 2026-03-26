'use server';

import { intelligentFraudDetection } from '@/ai/flows/intelligent-fraud-detection';
import { FirestoreService } from '@/lib/firestore-service';
import { where, Timestamp } from 'firebase/firestore';

/**
 * Mock Payment Gateway Integration
 */
async function initiateMockPayout(amount: number, workerId: string) {
  console.log(`[MOCK API] Initiating payout of ₹${amount} to worker ${workerId} via UPI...`);
  await new Promise(resolve => setTimeout(resolve, 1200));
  return {
    success: true,
    gatewayTransactionId: `PG_UPI_${Math.random().toString(36).substring(7).toUpperCase()}`,
    status: 'COMPLETED'
  };
}

/**
 * Simulates the parametric insurance engine using Firestore.
 */
export async function simulateParametricTrigger(
  disruptionData: {
    type: string;
    subType: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    location: string;
    description: string;
  }
) {
  try {
    // 1. Record the Disruption Event in Firestore
    const disruptionEvent = await FirestoreService.addDocument<any>('disruptions', {
      type: [disruptionData.type],
      subType: disruptionData.subType,
      severity: [disruptionData.severity],
      description: disruptionData.description,
      startDate: Timestamp.now(),
      affectedLocationIds: [disruptionData.location],
      source: 'Simulated Weather API',
      isVerified: true,
    });

    // 2. Scan for active policies in that location via Firestore
    const activePolicies = await FirestoreService.findMany<any>('policies', [
      where('status', '==', 'Active'),
      where('coveredLocationId', '==', disruptionData.location)
    ]);

    for (const policy of activePolicies) {
      const workerId = policy.gigWorkerId;
      
      // 3. Automatic Claim Initiation in Firestore
      const claim = await FirestoreService.addDocument<any>('claims', {
        gigWorkerId: workerId,
        policyId: policy.id,
        disruptionEventId: disruptionEvent.id,
        claimDate: Timestamp.now(),
        status: 'Initiated',
        claimedLostIncomeAmount: policy.coverageAmountPerDay || 500,
        isAutomated: true,
        lastUpdatedDate: Timestamp.now(),
      });

      // 4. Intelligent Fraud Detection
      try {
        const fraudResult = await intelligentFraudDetection({
           claimId: claim.id,
           workerId: workerId,
           claimDetails: `Automatic trigger: ${disruptionData.subType} in ${disruptionData.location}. Severity: ${disruptionData.severity}`,
           claimLocation: disruptionData.location,
           claimTime: new Date().toISOString(),
           workerActivityLog: "Mock Platform API: Periodic GPS pings stopped at disruption onset. Location verified.",
        });

        // 5. Process Payout if legitimate
        if (!fraudResult.isFraudulent && fraudResult.confidenceScore > 0.7) {
          await initiateMockPayout(claim.claimedLostIncomeAmount, workerId);

          await FirestoreService.updateDocument('claims', claim.id, {
            status: 'Paid',
            fraudScore: Math.round((1 - fraudResult.confidenceScore) * 100),
            approvedPayoutAmount: claim.claimedLostIncomeAmount,
            lastUpdatedDate: Timestamp.now()
          });
        } else {
          await FirestoreService.updateDocument('claims', claim.id, {
            status: 'Under Review',
            fraudScore: Math.round((1 - fraudResult.confidenceScore) * 100),
            fraudReason: fraudResult.fraudReason,
            lastUpdatedDate: Timestamp.now()
          });
        }
      } catch (e) {
        console.error("AI Fraud Detection Simulation Error", e);
      }
    }
  } catch (err) {
    console.error("Failed to execute parametric trigger:", err);
  }
}