import { NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore-service';
import { where, orderBy, limit } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId');

    let worker;
    if (workerId) {
      worker = await FirestoreService.getDocument<any>('workers', workerId);
    } else {
      // Get the most recently onboarded worker from Firestore
      const recentWorkers = await FirestoreService.findMany<any>('workers', [
        orderBy('onboardingDate', 'desc'),
        limit(1)
      ]);
      worker = recentWorkers[0] || null;
    }

    if (!worker) {
      return NextResponse.json({
        success: true,
        hasData: false,
        message: 'No onboarded worker found. Complete onboarding first.',
      });
    }

    // Fetch active policy from Firestore
    const policies = await FirestoreService.findMany<any>('policies', [
      where('gigWorkerId', '==', worker.id),
      where('status', '==', 'Active'),
      orderBy('createdAt', 'desc'),
      limit(1)
    ]);
    const policy = policies[0] || null;

    // Fetch location from Firestore
    let location = null;
    if (policy?.coveredLocationId) {
      location = await FirestoreService.getDocument<any>('locations', policy.coveredLocationId);
    }

    // Fetch recent claims from Firestore
    const claims = await FirestoreService.findMany<any>('claims', [
      where('gigWorkerId', '==', worker.id),
      orderBy('claimDate', 'desc'),
      limit(10)
    ]);

    // Aggregate total payouts
    const totalPayouts = claims
      .filter(c => c.status === 'Paid')
      .reduce((sum, c) => sum + (c.approvedPayoutAmount || 0), 0);

    return NextResponse.json({
      success: true,
      hasData: true,
      worker: {
        id: worker.id,
        firstName: worker.firstName,
        lastName: worker.lastName,
        email: worker.email,
        phone: worker.phoneNumber,
        persona: worker.deliveryPartnerCategory?.[0] || 'General Delivery',
        onboardingDate: worker.onboardingDate,
      },
      policy: policy ? {
        id: policy.id,
        status: policy.status,
        premiumAmount: policy.premiumAmount,
        coveragePerDay: policy.coverageAmountPerDay,
        coverageTotal: policy.coverageAmountTotal,
        startDate: policy.policyStartDate,
        endDate: policy.policyEndDate,
        nextPayment: policy.paymentDueDate,
        isPaid: policy.isPaid,
      } : null,
      location: location ? {
        city: location.city,
        state: location.state,
      } : null,
      claims: claims.map(c => ({
        id: c.id,
        date: c.claimDate,
        status: c.status,
        amount: c.claimedLostIncomeAmount,
        payout: c.approvedPayoutAmount,
        isAutomated: c.isAutomated,
      })),
      totalPayouts,
    });
  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
