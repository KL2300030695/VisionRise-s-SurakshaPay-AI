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
      // Demo Mode Fallback: Get all workers and find the most recent one in memory
      // This ensures the dashboard always shows something even if not logged in,
      // and avoids the need for a composite index on 'onboardingDate'.
      const allWorkers = await FirestoreService.findMany<any>('workers', []);
      worker = allWorkers.sort((a, b) => {
        const dateA = a.onboardingDate?.toMillis?.() || 0;
        const dateB = b.onboardingDate?.toMillis?.() || 0;
        return dateB - dateA;
      })[0] || null;
    }

    if (!worker) {
      return NextResponse.json({
        success: true,
        hasData: false,
        message: 'No onboarded worker found. Complete onboarding first.',
      });
    }

    // Fetch active policy from Firestore
    // Note: Simplified query to avoid composite index requirements
    const allPolicies = await FirestoreService.findMany<any>('policies', [
      where('gigWorkerId', '==', worker.id),
      where('status', '==', 'Active')
    ]);
    
    // Sort in memory to avoid index requirement
    const policy = allPolicies.sort((a, b) => {
      const dateA = a.createdAt?.toMillis?.() || 0;
      const dateB = b.createdAt?.toMillis?.() || 0;
      return dateB - dateA;
    })[0] || null;

    // Fetch location from Firestore
    let location = null;
    if (policy?.coveredLocationId) {
      location = await FirestoreService.getDocument<any>('locations', policy.coveredLocationId);
    }

    // Fetch recent claims from Firestore
    // Simplified query to avoid composite index requirements
    const allClaims = await FirestoreService.findMany<any>('claims', [
      where('gigWorkerId', '==', worker.id)
    ]);

    // Sort and limit in memory
    const claims = allClaims.sort((a, b) => {
      const dateA = a.claimDate?.toMillis?.() || 0;
      const dateB = b.claimDate?.toMillis?.() || 0;
      return dateB - dateA;
    }).slice(0, 10);

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
        amount: c.claimedLostIncomeAmount || 0,
        payout: c.approvedPayoutAmount || 0,
        isAutomated: c.isAutomated || false,
        upiPayoutUrl: c.upiPayoutUrl || ""
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
