import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = createServerClient();

    // Delete bookings where status = 'awaiting_payment' AND created_at < 30 minutes ago
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: deleted, error } = await supabase
      .from('bookings')
      .delete()
      .eq('status', 'awaiting_payment')
      .lt('created_at', thirtyMinutesAgo)
      .select('id');

    if (error) {
      console.error('Cleanup error:', error);
      return NextResponse.json(
        { error: 'Failed to cleanup abandoned bookings' },
        { status: 500 }
      );
    }

    const deletedCount = deleted?.length || 0;
    console.log(`Cleaned up ${deletedCount} abandoned bookings`);

    return NextResponse.json({
      success: true,
      deletedCount,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
