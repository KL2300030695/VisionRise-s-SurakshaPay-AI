'use server';

import { intelligentFraudDetection } from '@/ai/flows/intelligent-fraud-detection';
import dbConnect from '@/lib/mongodb';
import DisruptionEvent from '@/models/DisruptionEvent';
import GigWorker from '@/models/GigWorker';
import InsurancePolicy from '@/models/InsurancePolicy';
import Claim from '@/models/Claim';

/**
 * Mock Payment Gateway Integration (Simulating Razorpay/Stripe Sandbox)
 */
async function initiateMockPayout(amount: number, workerId: string) {
  console.log(`[MOCK API] Initiating payout of ₹${amount} to worker ${workerId} via UPI...`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  return {
    success: true,
    gatewayTransactionId: `PG_UPI_${Math.random().toString(36).substring(7).toUpperCase()}`,
    status: 'COMPLETED'
  };
}

/**
 * Simulates the parametric insurance engine.
 * 1. Detects a disruption.
 * 2. Identifies affected policies.
 * 3. Automatically initiates claims.
 * 4. Runs AI fraud detection.
 * 5. Approves and processes payouts for legitimate claims.
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
    await dbConnect();

    // 1. Record the Disruption Event (Simulating Weather API Feed)
    const disruptionEvent = await DisruptionEvent.create({
      type: [disruptionData.type],
      subType: disruptionData.subType,
      severity: [disruptionData.severity],
      description: disruptionData.description,
      startDate: new Date(),
      affectedLocationIds: [disruptionData.location], // Assuming this is an ObjectId string for now
      source: 'Simulated Weather API',
      isVerified: true,
    });

    const disruptionRefId = disruptionEvent._id.toString();

    // 2. Scan for active policies in that location
    // Find all active policies covering this location
    const activePolicies = await InsurancePolicy.find({
      status: 'Active',
      coveredLocationId: disruptionData.location
    });

    for (const policy of activePolicies) {
      const workerId = policy.gigWorkerId.toString();
      
      // 3. Automatic Claim Initiation
      const claim = await Claim.create({
        gigWorkerId: workerId,
        policyId: policy._id,
        disruptionEventId: disruptionEvent._id,
        claimDate: new Date(),
        status: 'Initiated',
        claimedLostIncomeAmount: policy.coverageAmountPerDay || 500,
        isAutomated: true,
      });

      const claimIdStr = claim._id.toString();

      // 4. Intelligent Fraud Detection (Calling AI Flow)
      try {
        const fraudResult = await intelligentFraudDetection({
           claimId: claimIdStr,
           workerId: workerId,
           claimDetails: `Automatic trigger: ${disruptionData.subType} in ${disruptionData.location}. Severity: ${disruptionData.severity}`,
           claimLocation: disruptionData.location,
           claimTime: new Date().toISOString(),
           workerActivityLog: "Mock Platform API: Periodic GPS pings stopped at disruption onset. Location verified.",
        });

        // 5. Process Payout if legitimate
        if (!fraudResult.isFraudulent && fraudResult.confidenceScore > 0.7) {
          // Call our Mock Payment Gateway
          const payoutResponse = await initiateMockPayout(claim.claimedLostIncomeAmount, workerId);

          claim.status = 'Paid';
          claim.fraudScore = Math.round((1 - fraudResult.confidenceScore) * 100);
          claim.approvedPayoutAmount = claim.claimedLostIncomeAmount;
          claim.lastUpdatedDate = new Date();
          await claim.save();

          // Note: In a complete implementation, we would also save the PayoutTransaction
          // to a separate PayoutTransaction collection here.

        } else {
          claim.status = 'Under Review';
          claim.fraudScore = Math.round((1 - fraudResult.confidenceScore) * 100);
          claim.fraudReason = fraudResult.fraudReason;
          claim.lastUpdatedDate = new Date();
          await claim.save();
        }
      } catch (e) {
        console.error("AI Fraud Detection Simulation Error", e);
      }
    }
  } catch (err) {
    console.error("Failed to execute parametric trigger:", err);
  }
}