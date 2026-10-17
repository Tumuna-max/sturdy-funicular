import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId, amountUsd, credits } = await request.json();
    const orderId = `ORDER_${Date.now()}_${userId.slice(0, 4)}`;

    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: amountUsd,
        price_currency: 'usd',
        pay_currency: 'usdttrc20',
        order_id: orderId,
        order_description: `${credits} Credits Purchase`,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/ipn`,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?status=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?status=cancel`,
      }),
    });

    const data = await response.json();

    if (data.invoice_url) {
      return NextResponse.json({ invoiceUrl: data.invoice_url, orderId });
    } else {
      return NextResponse.json({ error: 'Failed to generate payment invoice' }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
