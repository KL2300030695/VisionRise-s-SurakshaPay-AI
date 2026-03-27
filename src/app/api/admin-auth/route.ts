import { NextResponse } from 'next/server';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'veyon';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'veyon123';
const ADMIN_PIN = process.env.ADMIN_PIN || '123456';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, pin } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    // Step 1: Initial Login
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Step 2: PIN Verification (if provided)
      if (pin) {
        if (pin === ADMIN_PIN) {
          const token = `ADMIN_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
          return NextResponse.json({
            success: true,
            token,
            admin: { username },
            message: `Welcome, ${username}! Admin access granted.`,
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'Invalid Security PIN. Access denied.' },
            { status: 401 }
          );
        }
      }
      
      // If no PIN provided, signal that we need the second step
      return NextResponse.json({
        success: true,
        requirePin: true,
        message: 'Primary authentication successful. Please enter your Security PIN.'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid credentials. Access denied.' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed.' },
      { status: 500 }
    );
  }
}
