import { NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore-service';
import { where, Timestamp } from 'firebase/firestore';
import { sendRecoveryEmail } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, action } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (action === 'register') {
      // Check if worker already exists
      const existing = await FirestoreService.findOne<any>('workers', [where('email', '==', email)]);
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists. Please sign in.' },
          { status: 409 }
        );
      }

      // Create new worker record in Firestore
      const workerData = {
        externalAuthId: `AUTH_${Date.now()}`,
        firstName: body.firstName || email.split('@')[0],
        lastName: body.lastName || '',
        email,
        phoneNumber: body.phone || '',
        deliveryPartnerCategory: [],
        onboardingDate: Timestamp.now(),
        isActive: true,
      };

      const worker = await FirestoreService.addDocument<any>('workers', workerData);

      return NextResponse.json({
        success: true,
        action: 'registered',
        workerId: worker.id,
        worker: {
          id: worker.id,
          firstName: worker.firstName,
          lastName: worker.lastName,
          email: worker.email,
          phone: worker.phoneNumber,
        },
        message: 'Account created successfully!',
      });
    }

    // Login: find existing worker by email
    const worker = await FirestoreService.findOne<any>('workers', [where('email', '==', email)]);

    // Handle recovery simulation
    if (password === 'reset-check') {
      if (worker) {
        await sendRecoveryEmail(email, worker.firstName);
      }
      return NextResponse.json({
        success: true,
        message: 'Recovery email sent (simulated if no API key)',
      });
    }

    if (!worker) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email. Please sign up first.' },
        { status: 404 }
      );
    }

    // Update last activity in Firestore
    await FirestoreService.updateDocument('workers', worker.id, {
      lastActivityDate: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      action: 'login',
      workerId: worker.id,
      worker: {
        id: worker.id,
        firstName: worker.firstName,
        lastName: worker.lastName,
        email: worker.email,
        phone: worker.phoneNumber,
        persona: worker.deliveryPartnerCategory?.[0] || null,
      },
      message: `Welcome back, ${worker.firstName}!`,
    });
  } catch (error: any) {
    console.error('Auth API error:', error);
    
    // Provide more descriptive errors for common DB connection issues
    let errorMessage = error.message || 'Authentication failed';
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ETIMEDOUT')) {
      errorMessage = 'Database connection failed. Please check your MONGODB_URI and network connectivity.';
    } else if (errorMessage.includes('buffering timed out')) {
      errorMessage = 'The server is still connecting to the database. Please try again in a few seconds.';
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
