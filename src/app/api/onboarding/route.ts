import { NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore-service';
import { where, Timestamp } from 'firebase/firestore';

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
    const body = await request.json();

    const {
      firstName, lastName, email, phone, upiId, persona,
      city, weeklyPremium, riskFactors, explanation,
      guidewirePolicyId,
    } = body;

    // 1. Find or create Location in Firestore
    const cityMeta = CITY_META[city] || { state: city, coordinates: '0,0' };
    let location = await FirestoreService.findOne('locations', [where('city', '==', city)]);
    
    if (!location) {
      location = await FirestoreService.addDocument('locations', {
        name: city,
        city,
        state: cityMeta.state,
        country: 'India',
        coordinates: cityMeta.coordinates,
        description: `${city}, ${cityMeta.state}`,
      });
    }

    // 2. Find or create GigWorker (or find existing by email) in Firestore
    let worker = await FirestoreService.findOne<any>('workers', [where('email', '==', email)]);
    
    if (!worker) {
      worker = await FirestoreService.addDocument('workers', {
        externalAuthId: `AUTH_${Date.now()}`,
        firstName,
        lastName,
        email,
        phoneNumber: phone,
        upiId: upiId || 'NOT_SET',
        deliveryPartnerCategory: [persona],
        onboardingDate: Timestamp.now(),
        isActive: true,
      });
    } else {
      // Update existing worker with persona if not already set or changed
      await FirestoreService.updateDocument('workers', worker.id, {
        deliveryPartnerCategory: [persona],
        firstName: firstName || worker.firstName,
        lastName: lastName || worker.lastName,
        phoneNumber: phone || worker.phoneNumber,
        upiId: upiId || worker.upiId || 'NOT_SET',
      });
    }

    // 3. Create RiskProfile in Firestore
    const riskProfile = await FirestoreService.addDocument('riskProfiles', {
      gigWorkerId: worker.id,
      locationId: location.id,
      riskScore: Math.round(weeklyPremium * 2.5),
      predictedDisruptionLikelihood: riskFactors?.join(', ') || 'Standard',
      lastCalculatedDate: Timestamp.now(),
      effectiveDate: Timestamp.now(),
    });

    // 4. Create InsurancePolicy in Firestore
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 7);
    const paymentDue = new Date(now);
    paymentDue.setDate(paymentDue.getDate() + 7);

    const policy = await FirestoreService.addDocument('policies', {
      gigWorkerId: worker.id,
      policyStartDate: Timestamp.fromDate(now),
      policyEndDate: Timestamp.fromDate(endDate),
      premiumAmount: weeklyPremium,
      coverageAmountPerDay: 500,
      coverageAmountTotal: 3500,
      status: 'Active',
      paymentDueDate: Timestamp.fromDate(paymentDue),
      isPaid: true,
      riskProfileId: riskProfile.id,
      coveredLocationId: location.id,
    });

    // 5. Call Guidewire PolicyCenter mock
    let policyCenterId = guidewirePolicyId || `GW-PC-${Math.floor(Math.random() * 90000) + 10000}`;

    return NextResponse.json({
      success: true,
      workerId: worker.id,
      policyId: policy.id,
      policyCenterId,
      locationId: location.id,
      riskProfileId: riskProfile.id,
      message: 'Onboarding completed! Worker, policy, and risk profile saved to Firestore.',
    });
  } catch (error: any) {
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save onboarding data' },
      { status: 500 }
    );
  }
}
