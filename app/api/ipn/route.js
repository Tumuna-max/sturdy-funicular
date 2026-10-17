import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const bodyText = await request.text();
    const body = JSON.parse(bodyText);
    const receivedSig = request.headers.get('x-nowpayments-sig');

    // Verify HMAC signature from NOWPayments
    const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET);
    hmac.update(JSON.stringify(body, Object.keys(body).sort()));
    const calculatedSig = hmac.digest('hex');

    if (receivedSig !== calculatedSig) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Process finished payment
    if (body.payment_status === 'finished') {
      const orderId = body.order_id;

      await supabase
        .from('transactions')
        .update({ status: 'finished', payment_id: body.payment_id.toString() })
        .eq('order_id', orderId);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
