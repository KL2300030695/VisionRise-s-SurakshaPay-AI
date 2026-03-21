import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GigWorker from '@/models/GigWorker';
import InsurancePolicy from '@/models/InsurancePolicy';
import Claim from '@/models/Claim';
import Location from '@/models/Location';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId');

    let worker;
    if (workerId) {
      worker = await GigWorker.findById(workerId);
    } else {
      // Get the most recently onboarded worker
      worker = await GigWorker.findOne({}).sort({ createdAt: -1 });
    }

    if (!worker) {
      return NextResponse.json({
        success: true,
        hasData: false,
        message: 'No onboarded worker found. Complete onboarding first.',
      });
    }

    // Fetch active policy
    const policy = await InsurancePolicy.findOne({
      gigWorkerId: worker._id,
      status: 'Active',
    }).sort({ createdAt: -1 });

    // Fetch location
    let location = null;
    if (policy?.coveredLocationId) {
      location = await Location.findById(policy.coveredLocationId);
    }

    // Fetch recent claims / payouts
    const claims = await Claim.find({ gigWorkerId: worker._id })
      .sort({ claimDate: -1 })
      .limit(10);

    // Aggregate total payouts
    const totalPayouts = claims
      .filter(c => c.status === 'Paid')
      .reduce((sum, c) => sum + (c.approvedPayoutAmount || 0), 0);

    return NextResponse.json({
      success: true,
      hasData: true,
      worker: {
        id: worker._id,
        firstName: worker.firstName,
        lastName: worker.lastName,
        email: worker.email,
        phone: worker.phoneNumber,
        persona: worker.deliveryPartnerCategory?.[0] || 'General Delivery',
        onboardingDate: worker.onboardingDate,
      },
      policy: policy ? {
        id: policy._id,
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
        id: c._id,
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
