import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { amount, credits, userId } = await req.json();

    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        order_id: `CREDITS-${userId}-${Date.now()}`,
        order_description: `Purchase of ${credits} Credits on Frumence Date`,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://frumencedate.vercel.app'}/api/nowpayments/webhook`,
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://frumencedate.vercel.app'}/purchase-history?status=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://frumencedate.vercel.app'}/purchase-history?status=cancelled`,
      }),
    });

    const data = await response.json();

    if (data.invoice_url) {
      return NextResponse.json({ invoice_url: data.invoice_url });
    } else {
      return NextResponse.json({ error: data.message || 'Failed to create payment invoice.' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
