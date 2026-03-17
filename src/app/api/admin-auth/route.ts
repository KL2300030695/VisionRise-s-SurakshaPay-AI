import { NextResponse } from 'next/server';

const ADMIN_USERNAME = 'veyon';
const ADMIN_PASSWORD = 'veyon123';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = `ADMIN_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      return NextResponse.json({
        success: true,
        token,
        admin: { username },
        message: `Welcome, ${username}! Admin access granted.`,
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
