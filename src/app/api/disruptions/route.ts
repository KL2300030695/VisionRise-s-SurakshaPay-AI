import { NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore-service';
import { orderBy, limit } from 'firebase/firestore';

export async function GET() {
  try {
    // Fetch the 5 most recent disruptions from Firestore
    const disruptions = await FirestoreService.findMany<any>('disruptions', [
      orderBy('startDate', 'desc'),
      limit(5)
    ]);

    return NextResponse.json({
      success: true,
      disruptions: disruptions.map(d => ({
        id: d.id,
        type: d.type?.[0] || d.type,
        subType: d.subType,
        severity: d.severity?.[0] || d.severity,
        description: d.description,
        startDate: d.startDate,
        isVerified: d.isVerified,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch disruptions API", error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch disruptions' },
      { status: 500 }
    );
  }
}
