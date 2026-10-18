import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const amount = body.amount || 5;
    const credits = body.credits || 50;

    const apiKey = process.env.NOWPAYMENTS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'NOWPayments API key is missing.' }, { status: 500 });
    }

    const apiRes = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        order_id: `order_${Date.now()}`,
        order_description: `${credits} Credits Top-up`,
        ipn_callback_url: 'https://sturdy-funicular-eta.vercel.app/api/ipn',
        success_url: 'https://sturdy-funicular-eta.vercel.app/?success=true',
        cancel_url: 'https://sturdy-funicular-eta.vercel.app/?canceled=true',
      }),
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return NextResponse.json({ error: data.message || 'Invoice creation failed' }, { status: 500 });
    }

    return NextResponse.json({ invoice_url: data.invoice_url });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
