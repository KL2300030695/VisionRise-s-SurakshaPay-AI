import { NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore-service';
import { where, Timestamp, orderBy } from 'firebase/firestore';

// Admin-only middleware/check would go here in a production app
// For now, we assume admin access is verified by the request origin or token

export async function GET() {
  try {
    const workers = await FirestoreService.findMany<any>('workers', []);
    
    // Sort by onboarding date in memory to avoid index requirements
    const sortedWorkers = workers.sort((a, b) => {
      const dateA = a.onboardingDate?.toMillis?.() || 0;
      const dateB = b.onboardingDate?.toMillis?.() || 0;
      return dateB - dateA;
    });

    return NextResponse.json({ success: true, workers: sortedWorkers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, upiId, persona } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const worker = await FirestoreService.addDocument('workers', {
      externalAuthId: `ADMIN_MANUAL_${Date.now()}`,
      firstName,
      lastName,
      email,
      phoneNumber: phoneNumber || '',
      upiId: upiId || 'NOT_SET',
      deliveryPartnerCategory: persona ? [persona] : ['General'],
      onboardingDate: Timestamp.now(),
      isActive: true,
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ success: true, workerId: worker.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId');

    if (!workerId) {
      return NextResponse.json({ success: false, error: 'Worker ID is required' }, { status: 400 });
    }

    // Optional: Clean up related resources like policies and claims
    // const policies = await FirestoreService.findMany('policies', [where('gigWorkerId', '==', workerId)]);
    // for (const p of policies) await FirestoreService.deleteDocument('policies', p.id);

    await FirestoreService.deleteDocument('workers', workerId);

    return NextResponse.json({ success: true, message: 'Worker removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
