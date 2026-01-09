import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(
      `
      id,
      status,
      payment_status,
      stripe_payment_intent_id,
      guest_name,
      guest_email,
      check_in,
      check_out,
      total_price,
      total_nights,
      room_id,
      rooms (name, slug)
    `
    )
    .eq('id', id)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  return NextResponse.json(booking);
}
