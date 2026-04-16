import { NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore-service';
import { intelligentFraudDetection } from '@/ai/flows/intelligent-fraud-detection';
import { where, Timestamp } from 'firebase/firestore';
import { generateUpiIntent } from '@/lib/upi-utils';

export async function POST(request: Request) {
  try {
    const { workerId, problemDescription, location, workerActivityLog } = await request.json();

    if (!workerId || !problemDescription || !location) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Fetch worker and their active policy from Firestore
    const worker = await FirestoreService.getDocument<any>('workers', workerId);
    if (!worker) {
      return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 });
    }

    const policies = await FirestoreService.findMany<any>('policies', [
      where('gigWorkerId', '==', workerId),
      where('status', '==', 'Active')
    ]);
    const policy = policies[0] || null;

    if (!policy) {
      return NextResponse.json({ success: false, error: 'No active policy found' }, { status: 404 });
    }

    // 2. Create a preliminary Claim record in Firestore
    const upiPayoutUrl = generateUpiIntent(
      worker.upiId || 'NOT_SET',
      `${worker.firstName} ${worker.lastName}`,
      policy.coverageAmountPerDay
    );

    const claim = await FirestoreService.addDocument<any>('claims', {
      gigWorkerId: workerId,
      policyId: policy.id,
      claimDate: Timestamp.now(),
      status: 'Initiated',
      claimedLostIncomeAmount: policy.coverageAmountPerDay,
      isAutomated: true,
      stimulationQuery: problemDescription,
      payoutUpiId: worker.upiId || 'NOT_SET',
      upiPayoutUrl: upiPayoutUrl
    });

    // 3. Run Phase 3 Advanced AI Fraud Detection (4-tool pipeline)
    const fraudResult = await intelligentFraudDetection({
      claimId: claim.id,
      workerId: workerId,
      claimDetails: problemDescription,
      claimLocation: location,
      claimTime: new Date().toISOString(),
      // Pass activity log for GPS spoofing detection (Phase 3 requirement)
      workerActivityLog: workerActivityLog || undefined,
    });

    // 4. Determine final claim status based on AI fraud result
    let finalStatus = 'Approved';
    if (fraudResult.isFraudulent) {
      finalStatus = fraudResult.recommendedAction === 'deny claim' ? 'Denied' : 'Flagged';
    }

    // If approved, simulate instant payment by marking as Paid
    if (finalStatus === 'Approved') {
      finalStatus = 'Paid';
    }

    // 5. Update claim with full fraud audit trail
    await FirestoreService.updateDocument('claims', claim.id, {
      status: finalStatus,
      fraudScore: fraudResult.confidenceScore,
      fraudReason: fraudResult.fraudReason,
      fraudAnomalies: fraudResult.flaggedAnomalies || [],
      fraudRecommendation: fraudResult.recommendedAction,
      approvedPayoutAmount: finalStatus === 'Paid' ? policy.coverageAmountPerDay : 0,
      lastUpdatedDate: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      claimId: claim.id,
      status: finalStatus,
      fraudResult: {
        isFraudulent: fraudResult.isFraudulent,
        reason: fraudResult.fraudReason,
        confidence: fraudResult.confidenceScore,
        anomalies: fraudResult.flaggedAnomalies || [],
        recommendation: fraudResult.recommendedAction,
      },
      payoutAmount: finalStatus === 'Paid' ? policy.coverageAmountPerDay : 0,
      upiId: worker.upiId || 'NOT_SET',
      upiPayoutUrl: upiPayoutUrl,
    });

  } catch (error: any) {
    console.error('Error in stimulate-claim API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
