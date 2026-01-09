# BEFORE LAUNCH CHECKLIST

> **Purpose:** Tasks to complete before going live with the booking system
> **Last Updated:** January 2026

---

## STRIPE PAYMENTS (Phase 7-8)

### Database
- [X] Create `payment_logs` table for audit trail (SQL below)

### Testing
- [ ] Test declined card scenario (4000 0000 0000 0002)
- [ ] Test insufficient funds (4000 0000 0000 9995)
- [ ] Test 3D Secure authentication (4000 0025 0000 3155)
- [ ] Test idempotency (prevent double charges on retry)

### Production Deployment
- [ ] Complete Stripe business verification
- [ ] Switch to live API keys (`pk_live_`, `sk_live_`)
- [ ] Configure production webhook endpoint in Stripe Dashboard
- [ ] Update `STRIPE_WEBHOOK_SECRET` with production webhook secret
- [ ] Enable Stripe Radar for fraud protection
- [ ] Test with real card (small amount, immediate refund)
- [ ] Verify email receipts are being sent

### Optional Admin Features
- [ ] View payment status in admin dashboard
- [ ] Manual refund capability
- [ ] Payment history/logs view

---

## SQL MIGRATION - payment_logs table

Run this in Supabase SQL Editor:

```sql
-- Create payment_logs table for audit trail
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  stripe_event_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Admin can view payment logs
CREATE POLICY "Admin can view payment_logs" ON payment_logs
  FOR SELECT TO authenticated USING (true);

-- Allow anonymous insert for webhooks
CREATE POLICY "Allow webhook inserts" ON payment_logs
  FOR INSERT TO anon WITH CHECK (true);

-- Service role can insert payment logs
CREATE POLICY "Service can insert payment_logs" ON payment_logs
  FOR INSERT TO service_role WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_logs_booking_id ON payment_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_event_type ON payment_logs(event_type);
```

---

## ENVIRONMENT VARIABLES FOR PRODUCTION

```bash
# Replace test keys with live keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # From production webhook
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxx    # For webhook handler
```

---

## OTHER PRE-LAUNCH ITEMS (from CLAUDE.md)

- [ ] Visible FAQ Section on homepage or /faq page
- [ ] JSON-LD with HotelRoom schema
- [ ] Dynamic sitemap.xml
- [ ] Update robots.txt
- [ ] Create llms.txt for LLMs
- [X] Form antibot component (honeypot field)
- [ ] Replace deprecated middleware with proxy pattern
- [X] search-result page not working
- [ ] Some components are not translated as: select dates in booking widget in the rooms, calendar showing eng day name, number of nights in the bookign form, all the booking form.
- [ ] Privacy policy and coockie policy