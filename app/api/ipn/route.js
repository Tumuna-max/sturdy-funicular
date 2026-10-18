import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const sigHeader = request.headers.get('x-nowpayments-sig');
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

    if (ipnSecret && sigHeader) {
      const hmac = crypto.createHmac('sha512', ipnSecret);
      hmac.update(rawBody);
      const signature = hmac.digest('hex');
      if (signature !== sigHeader) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    const data = JSON.parse(rawBody);
    const { payment_status, order_id, price_amount, payment_id } = data;

    if (payment_status === 'finished' || payment_status === 'confirmed') {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const creditsToAdd = Math.round(price_amount * 10);

      await supabase.from('transactions').insert({
        order_id,
        payment_id: String(payment_id),
        amount_usd: price_amount,
        credits_added: creditsToAdd,
        status: payment_status,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
