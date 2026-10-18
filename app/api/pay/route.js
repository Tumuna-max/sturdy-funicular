import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const amount = body.amount || 10; // Set minimum default to 10
    const credits = body.credits || 100;

    const apiKey = process.env.NOWPAYMENTS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'NOWPayments API key is missing.' }, { status: 500 });
    }

    const payRes = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: 'usdttrc20',
        order_id: `order_${Date.now()}`,
        order_description: `${credits} Credits Top-up`,
        ipn_callback_url: 'https://sturdy-funicular-eta.vercel.app/api/ipn',
      }),
    });

    const payData = await payRes.json();

    if (!payRes.ok) {
      return NextResponse.json({ error: payData.message || 'Payment generation failed' }, { status: 500 });
    }

    const checkoutUrl = `https://nowpayments.io/payment/?payment_id=${payData.payment_id}`;

    return NextResponse.json({ invoice_url: checkoutUrl });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
