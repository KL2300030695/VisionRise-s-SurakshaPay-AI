import { NextResponse } from 'next/server';
import { runAutoTriggerScan } from '@/lib/automated-trigger-service';

export async function POST() {
  try {
    const result = await runAutoTriggerScan();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Auto-scan error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Auto-scan failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Allow polling via GET as well
  try {
    const result = await runAutoTriggerScan();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Auto-scan error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Auto-scan failed' },
      { status: 500 }
    );
  }
}
