import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const { amount, claimId, workerName } = await request.json();

    if (!amount || !claimId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Create a Razorpay order (amount is in paise)
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // Convert INR to paise
      currency: 'INR',
      receipt: `claim_${claimId}`,
      notes: {
        claimId,
        workerName: workerName || 'Delivery Partner',
        platform: 'SurakshaPay AI',
        type: 'Parametric Claim Payout',
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });

  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}
