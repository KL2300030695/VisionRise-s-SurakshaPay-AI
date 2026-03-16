import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simulate a network delay to ClaimCenter (2s - 3.5s) for auto-adjudication
    const delay = Math.floor(Math.random() * 1500) + 2000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Generate a mock ClaimCenter ID
    const randomId = Math.floor(Math.random() * 90000) + 10000;
    const claimCenterId = `GW-CC-${randomId}`;

    return NextResponse.json({
      success: true,
      claimCenterId,
      status: 'Settled',
      adjudicationMethod: 'Zero-Touch Auto-Adjudication',
      message: 'Claim settled instantly via Guidewire ClaimCenter Integration.',
      timestamp: new Date().toISOString(),
      details: body
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to connect to Guidewire ClaimCenter' },
      { status: 500 }
    );
  }
}
