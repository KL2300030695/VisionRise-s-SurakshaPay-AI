import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simulate a network delay to PolicyCenter (1.5s - 2.5s)
    const delay = Math.floor(Math.random() * 1000) + 1500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Generate a mock PolicyCenter ID
    const randomId = Math.floor(Math.random() * 90000) + 10000;
    const policyCenterId = `GW-PC-${randomId}`;

    return NextResponse.json({
      success: true,
      policyCenterId,
      message: 'Policy successfully synchronized with Guidewire PolicyCenter.',
      timestamp: new Date().toISOString(),
      details: body
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to connect to Guidewire PolicyCenter' },
      { status: 500 }
    );
  }
}
