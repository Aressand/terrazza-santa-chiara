# PHASE 9: ANTI-BOT & CLEANUP PROTECTION

> **Goal:** Protect booking system from spam bots and clean up abandoned bookings
> **Priority:** MEDIUM - Recommended before production launch
> **Estimated Effort:** 1-2 development sessions

---

## OVERVIEW

Implement protection against bot spam that could:
- Pollute the database with fake `awaiting_payment` bookings
- Trigger Stripe Radar fraud alerts from repeated failed payments
- Consume server resources unnecessarily

**Note:** Bot spam does NOT block room availability (only `confirmed` bookings block dates), but cleanup is still important for database hygiene.

---

## TASKS CHECKLIST

### 9.1 Honeypot Field (Anti-Bot)
- [ ] Add hidden honeypot field to BookingForm
- [ ] Validate honeypot is empty on server-side (create-payment-intent)
- [ ] Reject requests where honeypot is filled (bots auto-fill all fields)

### 9.2 Rate Limiting
- [ ] Implement rate limiting on `/api/bookings/create-payment-intent`
- [ ] Limit: 5 requests per IP per 7 minutes
- [ ] Return 429 Too Many Requests when exceeded

### 9.3 Cleanup Abandoned Bookings
- [ ] Create Supabase Edge Function or cron job
- [ ] Delete bookings where `status = 'awaiting_payment'` AND `created_at < NOW() - INTERVAL '30 minutes'`
- [ ] Run every 15 minutes
- [ ] Log cleanup actions for monitoring

### 9.4 Optional Enhancements
- [ ] Add reCAPTCHA v3 (invisible) for high-risk scenarios
- [ ] Implement email verification before payment
- [ ] Add browser fingerprinting

---

## IMPLEMENTATION GUIDE

### 9.1 Honeypot Field

**Update: `components/booking/BookingForm.tsx`**
```typescript
// Add hidden field (CSS hides it from humans, bots fill it)
<input
  type="text"
  name="website"
  value={formData.website || ''}
  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
  autoComplete="off"
  tabIndex={-1}
  style={{
    position: 'absolute',
    left: '-9999px',
    opacity: 0,
    height: 0,
    width: 0,
  }}
/>
```

**Update: `app/api/bookings/create-payment-intent/route.ts`**
```typescript
// Add at the start of POST handler
const { website, ...bookingData } = body;

// Honeypot check - if filled, it's a bot
if (website) {
  console.log('Bot detected via honeypot');
  // Return fake success to not alert bot
  return NextResponse.json({
    clientSecret: 'fake_secret',
    bookingId: 'fake_id',
    paymentIntentId: 'fake_pi',
  });
}
```

### 9.2 Rate Limiting

**Install package:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Or simple in-memory rate limiting:**
```typescript
// lib/rateLimit.ts
const requests = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, limit = 5, windowMs = 600000): boolean {
  const now = Date.now();
  const record = requests.get(ip);

  if (!record || now > record.resetTime) {
    requests.set(ip, { count: 1, resetTime: now + windowMs });
    return true; // Allowed
  }

  if (record.count >= limit) {
    return false; // Rate limited
  }

  record.count++;
  return true; // Allowed
}
```

**Update API route:**
```typescript
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  // ... rest of handler
}
```

### 9.3 Cleanup Abandoned Bookings

**SQL Function (run in Supabase SQL Editor):**
```sql
-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_abandoned_bookings()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM bookings
  WHERE status = 'awaiting_payment'
    AND created_at < NOW() - INTERVAL '30 minutes';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Log the cleanup
  INSERT INTO payment_logs (event_type, payload)
  VALUES ('cleanup_abandoned', jsonb_build_object(
    'deleted_count', deleted_count,
    'cleanup_time', NOW()
  ));

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create pg_cron job (if pg_cron extension is enabled)
-- SELECT cron.schedule('cleanup-abandoned-bookings', '*/15 * * * *', 'SELECT cleanup_abandoned_bookings()');
```

**Alternative: Supabase Edge Function**
```typescript
// supabase/functions/cleanup-bookings/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('bookings')
    .delete()
    .eq('status', 'awaiting_payment')
    .lt('created_at', thirtyMinutesAgo)
    .select('id');

  const deletedCount = data?.length || 0;
  console.log(`Cleaned up ${deletedCount} abandoned bookings`);

  return new Response(JSON.stringify({ deletedCount }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

## SECURITY NOTES

### Why Honeypot Works
- Bots auto-fill ALL form fields
- Hidden field is invisible to humans (CSS)
- If field has value → definitely a bot

### Why 30 Minutes for Cleanup
- Stripe PaymentIntent expires after 24 hours
- 30 minutes is generous for legitimate users
- Prevents database bloat from abandoned checkouts

### Rate Limiting Considerations
- 5 requests per 10 minutes is reasonable for legitimate users
- Shared IPs (offices, VPNs) may need higher limits
- Consider using Stripe's built-in rate limiting as backup

---

## FILES TO CREATE/MODIFY

| Action | File | Purpose |
|--------|------|---------|
| MODIFY | `components/booking/BookingForm.tsx` | Add honeypot field |
| MODIFY | `app/api/bookings/create-payment-intent/route.ts` | Validate honeypot + rate limit |
| CREATE | `lib/rateLimit.ts` | Rate limiting utility |
| CREATE | `supabase/functions/cleanup-bookings/index.ts` | Cleanup edge function |

---

## TESTING

1. **Honeypot Test:**
   - Fill the hidden field manually via browser DevTools
   - Submit form → should return fake success, no booking created

2. **Rate Limit Test:**
   - Send 6+ rapid requests to create-payment-intent
   - 6th request should return 429

3. **Cleanup Test:**
   - Create booking, don't complete payment
   - Wait 30+ minutes (or adjust interval for testing)
   - Verify booking is deleted

---

## STRIPE RADAR (Already Included)

Stripe Radar provides automatic fraud protection:
- Machine learning fraud detection
- Blocks suspicious cards automatically
- No additional implementation needed
- Enable in Stripe Dashboard → Radar → Rules
