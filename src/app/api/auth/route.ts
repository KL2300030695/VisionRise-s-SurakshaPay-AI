import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GigWorker from '@/models/GigWorker';
import { sendRecoveryEmail } from '@/lib/resend';

/**
 * POST /api/auth
 * Handles both login and registration:
 * - If a worker with this email exists → login (return worker data)
 * - If not → register a new worker
 */
export async function POST(request: Request) {
  try {
    await dbConnect();
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
      const existing = await GigWorker.findOne({ email });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists. Please sign in.' },
          { status: 409 }
        );
      }

      // Create new worker with basic info (full profile completed during onboarding)
      const worker = await GigWorker.create({
        externalAuthId: `AUTH_${Date.now()}`,
        firstName: body.firstName || email.split('@')[0],
        lastName: body.lastName || '',
        email,
        phoneNumber: body.phone || '',
        deliveryPartnerCategory: [],
        onboardingDate: new Date(),
        isActive: true,
      });

      return NextResponse.json({
        success: true,
        action: 'registered',
        workerId: worker._id,
        worker: {
          id: worker._id,
          firstName: worker.firstName,
          lastName: worker.lastName,
          email: worker.email,
        },
        message: 'Account created successfully!',
      });
    }

    // Login: find existing worker by email
    const worker = await GigWorker.findOne({ email });

    // Handle recovery simulation/trigger from frontend
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

    // Update last activity
    worker.lastActivityDate = new Date();
    await worker.save();

    return NextResponse.json({
      success: true,
      action: 'login',
      workerId: worker._id,
      worker: {
        id: worker._id,
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
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
