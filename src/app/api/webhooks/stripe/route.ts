import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createServerClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata.booking_id;

      if (bookingId) {
        // Update booking status
        const { error } = await supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            payment_status: 'succeeded',
            stripe_charge_id:
              typeof paymentIntent.latest_charge === 'string'
                ? paymentIntent.latest_charge
                : null,
            paid_at: new Date().toISOString(),
          })
          .eq('id', bookingId);

        if (error) {
          console.error('Failed to update booking:', error);
        } else {
          console.log(`Booking ${bookingId} confirmed after payment`);
        }
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata.booking_id;

      if (bookingId) {
        await supabase
          .from('bookings')
          .update({
            payment_status: 'failed',
          })
          .eq('id', bookingId);

        console.log(`Payment failed for booking ${bookingId}`);
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;

      // Find booking by charge ID
      const { data: booking } = await supabase
        .from('bookings')
        .select('id')
        .eq('stripe_charge_id', charge.id)
        .single();

      if (booking) {
        await supabase
          .from('bookings')
          .update({
            status: 'refunded',
            payment_status: 'refunded',
          })
          .eq('id', booking.id);

        console.log(`Booking ${booking.id} refunded`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
