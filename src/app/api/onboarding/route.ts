import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GigWorker from '@/models/GigWorker';
import Location from '@/models/Location';
import RiskProfile from '@/models/RiskProfile';
import InsurancePolicy from '@/models/InsurancePolicy';

// City metadata for Location creation
const CITY_META: Record<string, { state: string; coordinates: string }> = {
  Mumbai: { state: 'Maharashtra', coordinates: '19.076,72.8777' },
  Delhi: { state: 'Delhi', coordinates: '28.6139,77.209' },
  Bangalore: { state: 'Karnataka', coordinates: '12.9716,77.5946' },
  Hyderabad: { state: 'Telangana', coordinates: '17.385,78.4867' },
  Chennai: { state: 'Tamil Nadu', coordinates: '13.0827,80.2707' },
  Kolkata: { state: 'West Bengal', coordinates: '22.5726,88.3639' },
};

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      firstName, lastName, email, phone, persona,
      city, weeklyPremium, riskFactors, explanation,
      guidewirePolicyId,
    } = body;

    // 1. Find or create Location
    const cityMeta = CITY_META[city] || { state: city, coordinates: '0,0' };
    let location = await Location.findOne({ city });
    if (!location) {
      location = await Location.create({
        name: city,
        city,
        state: cityMeta.state,
        country: 'India',
        coordinates: cityMeta.coordinates,
        description: `${city}, ${cityMeta.state}`,
      });
    }

    // 2. Find or create GigWorker (or find existing by email)
    let worker = await GigWorker.findOne({ email });
    if (!worker) {
      worker = await GigWorker.create({
        externalAuthId: `AUTH_${Date.now()}`,
        firstName,
        lastName,
        email,
        phoneNumber: phone,
        deliveryPartnerCategory: [persona],
        onboardingDate: new Date(),
        isActive: true,
      });
    } else {
      // Update existing worker with persona if not already set or changed
      worker.deliveryPartnerCategory = [persona];
      worker.firstName = firstName || worker.firstName;
      worker.lastName = lastName || worker.lastName;
      worker.phoneNumber = phone || worker.phoneNumber;
      await worker.save();
    }

    // 3. Create RiskProfile
    const riskProfile = await RiskProfile.create({
      gigWorkerId: worker._id,
      locationId: location._id,
      riskScore: Math.round(weeklyPremium * 2.5), // Derived from premium
      predictedDisruptionLikelihood: riskFactors?.join(', ') || 'Standard',
      lastCalculatedDate: new Date(),
      effectiveDate: new Date(),
    });

    // 4. Create InsurancePolicy
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 7); // Weekly policy
    const paymentDue = new Date(now);
    paymentDue.setDate(paymentDue.getDate() + 7);

    const policy = await InsurancePolicy.create({
      gigWorkerId: worker._id,
      policyStartDate: now,
      policyEndDate: endDate,
      premiumAmount: weeklyPremium,
      coverageAmountPerDay: 500,
      coverageAmountTotal: 3500, // 7 days × ₹500
      status: 'Active',
      paymentDueDate: paymentDue,
      isPaid: true,
      riskProfileId: riskProfile._id,
      coveredLocationId: location._id,
    });

    // 5. Call Guidewire PolicyCenter mock
    let policyCenterId = guidewirePolicyId || `GW-PC-${Math.floor(Math.random() * 90000) + 10000}`;

    return NextResponse.json({
      success: true,
      workerId: worker._id,
      policyId: policy._id,
      policyCenterId,
      locationId: location._id,
      riskProfileId: riskProfile._id,
      message: 'Onboarding completed! Worker, policy, and risk profile saved.',
    });
  } catch (error: any) {
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save onboarding data' },
      { status: 500 }
    );
  }
}
