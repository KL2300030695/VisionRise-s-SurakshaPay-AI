import { NextResponse } from 'next/server';
import { calculateDynamicPremium } from '@/lib/dynamic-pricing-engine';
import { FirestoreService } from '@/lib/firestore-service';
import { where } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workerId } = body;

    if (!workerId) {
      return NextResponse.json(
        { success: false, error: 'workerId is required' },
        { status: 400 }
      );
    }

    // Fetch worker data
    const worker = await FirestoreService.getDocument<any>('workers', workerId);
    if (!worker) {
      return NextResponse.json(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      );
    }

    // Fetch active policy
    const policy = await FirestoreService.findOne<any>('policies', [
      where('gigWorkerId', '==', workerId),
      where('status', '==', 'Active'),
    ]);

    if (!policy) {
      return NextResponse.json(
        { success: false, error: 'No active policy found' },
        { status: 404 }
      );
    }

    // Fetch claim count
    const claims = await FirestoreService.findMany<any>('claims', [
      where('gigWorkerId', '==', workerId),
    ]);

    // Calculate weeks since onboarding
    const onboardingDate = worker.onboardingDate?.toDate?.() || new Date(worker.onboardingDate) || new Date();
    const weeksSince = Math.floor((Date.now() - onboardingDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

    // Get location
    const location = policy.coveredLocationId
      ? await FirestoreService.getDocument<any>('locations', policy.coveredLocationId)
      : null;

    // Run dynamic pricing engine
    const result = await calculateDynamicPremium({
      basePremium: policy.premiumAmount || 25,
      city: location?.city || 'Mumbai',
      persona: worker.deliveryPartnerCategory?.[0] || 'Food Delivery',
      totalPastClaims: claims.length,
      weeksSinceOnboarding: weeksSince,
    });

    // Update the policy with new premium if changed
    if (Math.abs(result.adjustedPremium - policy.premiumAmount) > 0.5) {
      await FirestoreService.updateDocument('policies', policy.id, {
        premiumAmount: result.adjustedPremium,
        lastPremiumRecalculation: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      policyId: policy.id,
      ...result,
    });
  } catch (error: any) {
    console.error('Premium recalculation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to recalculate premium' },
      { status: 500 }
    );
  }
}
