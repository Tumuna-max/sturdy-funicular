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

    // Step 1: Create Invoice
    const invoiceRes = await fetch('https://api.nowpayments.io/v1/invoice', {
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
        success_url: 'https://sturdy-funicular-eta.vercel.app/?success=true',
        cancel_url: 'https://sturdy-funicular-eta.vercel.app/?canceled=true',
      }),
    });

    const invoiceData = await invoiceRes.json();

    if (!invoiceRes.ok || !invoiceData.id) {
      return NextResponse.json({ error: invoiceData.message || 'Invoice creation failed' }, { status: 500 });
    }

    // Step 2: Create Payment directly for USDT TRC-20
    const paymentRes = await fetch('https://api.nowpayments.io/v1/invoice-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        iid: invoiceData.id,
        pay_currency: 'usdttrc20'
      }),
    });

    const paymentData = await paymentRes.json();

    // Return the invoice URL or payment link
    const redirectUrl = invoiceData.invoice_url;

    return NextResponse.json({ invoice_url: redirectUrl });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
