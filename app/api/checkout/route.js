import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { priceAmount, orderId } = await request.json();

    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: priceAmount,
        price_currency: 'usd',
        order_id: orderId || `ORDER_${Date.now()}`,
        order_description: 'Credit Top-Up',
        ipn_callback_url: 'https://sturdy-funicular-eta.vercel.app/api/ipn',
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sturdy-funicular-eta.vercel.app'}/dashboard?status=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sturdy-funicular-eta.vercel.app'}/topup?status=cancelled`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Failed to create invoice' }, { status: 400 });
    }

    return NextResponse.json({ invoiceUrl: data.invoice_url });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
