import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DisruptionEvent from '@/models/DisruptionEvent';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch the 5 most recent disruptions
    const disruptions = await DisruptionEvent.find({})
      .sort({ startDate: -1 })
      .limit(5);

    return NextResponse.json({ success: true, disruptions });
  } catch (error) {
    console.error("Failed to fetch disruptions API", error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch disruptions' },
      { status: 500 }
    );
  }
}
