import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createServerClient } from '@/lib/supabase/server';
import { CreatePaymentIntentRequest } from '@/types/booking';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body: CreatePaymentIntentRequest = await request.json();

    // Honeypot check - extract and remove from body
    const { website, ...bookingData } = body as any;

    // If honeypot field is filled, it's a bot - return fake success
    if (website) {
      console.log('Bot detected via honeypot');
      return NextResponse.json({
        clientSecret: 'fake_secret',
        bookingId: 'fake_id',
        paymentIntentId: 'fake_pi',
      });
    }

    // Validate required fields
    const {
      room_id,
      check_in,
      check_out,
      guest_name,
      guest_email,
      guests_count,
      total_price,
    } = bookingData;

    if (
      !room_id ||
      !check_in ||
      !check_out ||
      !guest_name ||
      !guest_email ||
      !guests_count ||
      !total_price
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate nights
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Convert EUR to cents for Stripe
    const amountInCents = Math.round(total_price * 100);

    // Create Supabase client
    const supabase = createServerClient();

    // Fetch room details for metadata
    const { data: room } = await supabase
      .from('rooms')
      .select('name, slug')
      .eq('id', room_id)
      .single();

    // Create booking record first (status: awaiting_payment)
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        room_id,
        check_in,
        check_out,
        guest_name,
        guest_email,
        guest_phone: bookingData.guest_phone || null,
        guest_country: bookingData.guest_country || null,
        guests_count,
        total_nights: nights,
        total_price,
        special_requests: bookingData.special_requests || null,
        status: 'awaiting_payment',
        payment_status: 'pending',
        payment_amount: amountInCents,
        payment_currency: 'eur',
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error('Booking creation error:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        booking_id: booking.id,
        room_id,
        room_name: room?.name || 'Unknown Room',
        check_in,
        check_out,
        nights: nights.toString(),
        guest_email,
      },
      receipt_email: guest_email,
      description: `Terrazza Santa Chiara - ${room?.name} (${nights} nights: ${check_in} to ${check_out})`,
    });

    // Update booking with PaymentIntent ID
    await supabase
      .from('bookings')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'processing',
      })
      .eq('id', booking.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingId: booking.id,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
