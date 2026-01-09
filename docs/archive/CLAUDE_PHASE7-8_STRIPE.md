# PHASE 7-8: STRIPE PAYMENT INTEGRATION

> **Goal:** Implement secure payment processing with Stripe for direct bookings
> **Priority:** HIGH - Required for monetization
> **Estimated Effort:** 4-5 development sessions

---

## OVERVIEW

Integrate Stripe payment processing to accept credit card payments for bookings:
- **Mode:** Test mode first, then production
- **Flow:** Payment Intent → Card Collection → Confirmation
- **Strategy:** Authorize & capture (not charge immediately)
- **Security:** Server-side payment creation, webhook verification

---

## STRIPE CONCEPTS

### Key Terms
- **PaymentIntent:** Server-side object representing a payment attempt
- **Client Secret:** Token passed to frontend to complete payment
- **Webhook:** Server endpoint that receives Stripe events (payment success/failure)
- **Idempotency Key:** Prevents duplicate charges on retries

### Payment Flow
```
1. User fills booking form → Frontend
2. Create PaymentIntent → API Route (server)
3. Return client_secret → Frontend
4. Collect card details → Stripe Elements (frontend)
5. Confirm payment → Stripe.js (frontend)
6. Payment succeeds → Stripe sends webhook
7. Update booking status → Webhook handler (server)
8. Show confirmation → Frontend
```

---

## TASKS CHECKLIST

### 7.1 Stripe Account Setup
- [X] Create Stripe account at stripe.com
- [X] Complete business verification
- [X] Get API keys (test mode first)
- [X] Configure webhook endpoints
- [X] Set up Stripe CLI for local testing

### 7.2 Environment & Dependencies
- [X] Install Stripe packages
- [X] Add environment variables
- [X] Create Stripe client utilities

### 7.3 Database Schema Updates
- [X] Add payment fields to `bookings` table
- [ ] Create `payment_logs` table for audit trail
- [X] Update booking types/interfaces
- [X] Update `bookings_status_check` constraint

### 7.4 API Routes
- [X] `POST /api/bookings/create-payment-intent` - Create payment intent
- [X] `POST /api/webhooks/stripe` - Handle Stripe webhooks
- [X] `GET /api/bookings/[id]/status` - Check booking/payment status

### 7.5 Frontend Integration
- [X] Install @stripe/stripe-js and @stripe/react-stripe-js
- [X] Create StripeProvider component
- [X] Update BookingForm Step 3 with Stripe Elements
- [X] Handle payment confirmation flow
- [X] Error handling and retry logic

### 7.6 Testing
- [X] Test with Stripe test cards (4242 4242 4242 4242 - SUCCESS)
- [X] Test webhook handling locally (Stripe CLI)
- [X] Test error scenarios (declined: 4000 0000 0000 0002)
- [ ] Test idempotency (prevent double charges)

### 7.7 Production Deployment
- [ ] Switch to live API keys
- [ ] Configure production webhook endpoint
- [ ] Enable fraud prevention (Radar)
- [ ] Test with real card (small amount, refund immediately)

### 7.8 Admin Features (Optional)
- [ ] View payment status in admin
- [ ] Manual refund capability
- [ ] Payment history/logs

---

## IMPLEMENTATION GUIDE

### 7.1 Stripe Account Setup

1. **Create Account:** Go to [stripe.com](https://stripe.com) and sign up
2. **Business Info:** Complete the business profile (required for payouts)
3. **API Keys Location:** Dashboard → Developers → API keys
   - `Publishable key` (pk_test_...) - Frontend, safe to expose
   - `Secret key` (sk_test_...) - Backend only, NEVER expose

4. **Webhook Setup:**
   - Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to listen: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy `Webhook signing secret` (whsec_...)

### 7.2 Environment & Dependencies

**Install packages:**
```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

**Environment variables (.env.local):**
```bash
# Stripe Test Keys (use these first)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Live Keys (production only - add later)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
# STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
# STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**File: `lib/stripe/server.ts`** (Server-side Stripe client)
```typescript
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia', // Use latest stable API version
  typescript: true,
});
```

**File: `lib/stripe/client.ts`** (Client-side Stripe loader)
```typescript
import { loadStripe } from '@stripe/stripe-js';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
}

export const stripePromise = loadStripe(publishableKey);
```

### 7.3 Database Schema Updates

**SQL Migration (run in Supabase SQL Editor):**
```sql
-- Add payment fields to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_charge_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_amount INTEGER; -- in cents
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_currency TEXT DEFAULT 'eur';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Create index for payment lookups
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent
  ON bookings(stripe_payment_intent_id);

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

-- Service role can insert payment logs (for webhooks)
CREATE POLICY "Service can insert payment_logs" ON payment_logs
  FOR INSERT WITH CHECK (true);

-- Update bookings status enum (if using enum)
-- If status is TEXT, this is optional but recommended
COMMENT ON COLUMN bookings.status IS 'pending | awaiting_payment | confirmed | cancelled | refunded';
COMMENT ON COLUMN bookings.payment_status IS 'pending | processing | succeeded | failed | refunded';
```

**Update types (`src/types/booking.ts`):**
```typescript
// Add to existing types
export type BookingStatus =
  | 'pending'           // Initial state
  | 'awaiting_payment'  // PaymentIntent created, waiting for card
  | 'confirmed'         // Payment succeeded
  | 'cancelled'         // Cancelled by user/admin
  | 'refunded';         // Payment refunded

export type PaymentStatus =
  | 'pending'     // No payment attempt yet
  | 'processing'  // Payment in progress
  | 'succeeded'   // Payment completed
  | 'failed'      // Payment failed
  | 'refunded';   // Refunded

export interface BookingWithPayment extends BookingConfirmation {
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  payment_status: PaymentStatus;
  payment_amount?: number;
  payment_currency?: string;
  paid_at?: string;
}

export interface CreatePaymentIntentRequest {
  room_id: string;
  check_in: string;      // YYYY-MM-DD
  check_out: string;     // YYYY-MM-DD
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  guest_country?: string;
  guests_count: number;
  total_price: number;   // in EUR (e.g., 150.00)
  special_requests?: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  bookingId: string;
  paymentIntentId: string;
}
```

### 7.4 API Routes

**File: `app/api/bookings/create-payment-intent/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';
import { CreatePaymentIntentRequest } from '@/types/booking';

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentIntentRequest = await request.json();

    // Validate required fields
    const { room_id, check_in, check_out, guest_name, guest_email,
            guests_count, total_price } = body;

    if (!room_id || !check_in || !check_out || !guest_name ||
        !guest_email || !guests_count || !total_price) {
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
    const supabase = await createClient();

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
        guest_phone: body.guest_phone || null,
        guest_country: body.guest_country || null,
        guests_count,
        total_nights: nights,
        total_price,
        special_requests: body.special_requests || null,
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
```

**File: `app/api/webhooks/stripe/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Use service role for webhooks (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Log the event
  await supabaseAdmin.from('payment_logs').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event.data.object,
  });

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata.booking_id;

      if (bookingId) {
        // Update booking status
        await supabaseAdmin
          .from('bookings')
          .update({
            status: 'confirmed',
            payment_status: 'succeeded',
            stripe_charge_id: paymentIntent.latest_charge as string,
            paid_at: new Date().toISOString(),
          })
          .eq('id', bookingId);

        // TODO: Send confirmation email
        console.log(`Booking ${bookingId} confirmed after payment`);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata.booking_id;

      if (bookingId) {
        await supabaseAdmin
          .from('bookings')
          .update({
            payment_status: 'failed',
            status: 'cancelled', // Or keep as 'awaiting_payment' for retry
          })
          .eq('id', bookingId);

        console.log(`Payment failed for booking ${bookingId}`);
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;

      // Find booking by charge ID
      const { data: booking } = await supabaseAdmin
        .from('bookings')
        .select('id')
        .eq('stripe_charge_id', charge.id)
        .single();

      if (booking) {
        await supabaseAdmin
          .from('bookings')
          .update({
            status: 'refunded',
            payment_status: 'refunded',
          })
          .eq('id', booking.id);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// Disable body parsing for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
```

**File: `app/api/bookings/[id]/status/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      id,
      status,
      payment_status,
      stripe_payment_intent_id,
      guest_name,
      guest_email,
      check_in,
      check_out,
      total_price,
      room_id,
      rooms (name, slug)
    `)
    .eq('id', id)
    .single();

  if (error || !booking) {
    return NextResponse.json(
      { error: 'Booking not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(booking);
}
```

### 7.5 Frontend Integration

**File: `components/booking/StripeProvider.tsx`**
```typescript
'use client';

import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe/client';
import { ReactNode } from 'react';

interface StripeProviderProps {
  children: ReactNode;
  clientSecret: string;
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#4A5D4A', // sage color to match site
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
```

**File: `components/booking/PaymentForm.tsx`**
```typescript
'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, Lock } from 'lucide-react';

interface PaymentFormProps {
  bookingId: string;
  totalPrice: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function PaymentForm({
  bookingId,
  totalPrice,
  onSuccess,
  onError
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/confirmation/${bookingId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred');
      onError('Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-sage-50 p-4 rounded-lg border border-sage-200">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-sage hover:bg-sage-dark text-white py-3"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Pay €{totalPrice.toFixed(2)}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
        <Lock className="h-3 w-3" />
        Secured by Stripe. Your card details are encrypted.
      </p>
    </form>
  );
}
```

**Update: `components/booking/BookingForm.tsx` (Step 3 section)**
```typescript
// Replace the mock payment section in Step 3 with:

import { StripeProvider } from './StripeProvider';
import { PaymentForm } from './PaymentForm';

// In the component, add state:
const [clientSecret, setClientSecret] = useState<string | null>(null);
const [bookingId, setBookingId] = useState<string | null>(null);
const [paymentError, setPaymentError] = useState<string | null>(null);

// When user reaches Step 3, create PaymentIntent:
const handleProceedToPayment = async () => {
  try {
    const response = await fetch('/api/bookings/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_id: roomId,
        check_in: checkIn,
        check_out: checkOut,
        guest_name: `${formData.firstName} ${formData.lastName}`,
        guest_email: formData.email,
        guest_phone: formData.phone,
        guest_country: formData.country,
        guests_count: formData.guests,
        total_price: pricing.totalPrice,
        special_requests: formData.specialRequests,
      }),
    });

    const data = await response.json();

    if (data.error) {
      setPaymentError(data.error);
      return;
    }

    setClientSecret(data.clientSecret);
    setBookingId(data.bookingId);
    setCurrentStep(3);
  } catch (error) {
    setPaymentError('Failed to initialize payment');
  }
};

// In Step 3 render:
{currentStep === 3 && clientSecret && bookingId && (
  <StripeProvider clientSecret={clientSecret}>
    <PaymentForm
      bookingId={bookingId}
      totalPrice={pricing.totalPrice}
      onSuccess={() => {
        // Fetch updated booking and show confirmation
        onComplete(/* booking confirmation data */);
      }}
      onError={(error) => setPaymentError(error)}
    />
  </StripeProvider>
)}
```

### 7.6 Testing

**Stripe Test Cards:**
```
Success:           4242 4242 4242 4242
Decline:           4000 0000 0000 0002
Insufficient:      4000 0000 0000 9995
Requires Auth:     4000 0025 0000 3155
```

**Local Webhook Testing with Stripe CLI:**
```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Windows: scoop install stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# The CLI will show a webhook signing secret (whsec_...)
# Use this in your local .env.local
```

**Test Scenarios:**
1. ✅ Successful payment → booking confirmed
2. ✅ Declined card → booking stays awaiting_payment
3. ✅ 3D Secure required → redirect and complete
4. ✅ Webhook arrives → status updated
5. ✅ Double-click prevention (idempotency)
6. ✅ Session timeout handling

### 7.7 Production Checklist

**Before Going Live:**
- [ ] Complete Stripe business verification
- [ ] Switch to live API keys
- [ ] Configure production webhook URL in Stripe Dashboard
- [ ] Enable Stripe Radar for fraud protection
- [ ] Test with a real card (€1 charge, immediate refund)
- [ ] Verify email receipts are being sent
- [ ] Check that all error states are handled gracefully

**Environment Variables for Production:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # Get from production webhook
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxx    # For webhook handler
```

---

## SECURITY CONSIDERATIONS

### DO
- ✅ Create PaymentIntents server-side only
- ✅ Verify webhook signatures
- ✅ Use HTTPS everywhere
- ✅ Store minimal card data (Stripe handles PCI compliance)
- ✅ Use idempotency keys for retries
- ✅ Log payment events for audit trail
- ✅ Validate amounts server-side (don't trust frontend)

### DON'T
- ❌ Never expose `STRIPE_SECRET_KEY` to frontend
- ❌ Never log full card numbers
- ❌ Never store card details in your database
- ❌ Never trust frontend-provided amounts for final charge
- ❌ Never skip webhook signature verification

---

## ERROR HANDLING

**Common Errors & Solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| `card_declined` | Card was declined | Show user-friendly message, suggest different card |
| `expired_card` | Card is expired | Ask for different card |
| `incorrect_cvc` | CVC is wrong | Ask user to verify CVC |
| `processing_error` | Stripe internal error | Retry after a moment |
| `insufficient_funds` | Not enough balance | Suggest different card |

**User-Facing Messages:**
```typescript
const getErrorMessage = (code: string): string => {
  const messages: Record<string, string> = {
    card_declined: 'Your card was declined. Please try a different card.',
    expired_card: 'Your card has expired. Please use a different card.',
    incorrect_cvc: 'The CVC code is incorrect. Please check and try again.',
    processing_error: 'An error occurred processing your card. Please try again.',
    insufficient_funds: 'Insufficient funds. Please try a different card.',
  };
  return messages[code] || 'An error occurred. Please try again.';
};
```

---

## REFUND HANDLING (Optional Phase 8)

**Admin Refund API:**
```typescript
// app/api/admin/bookings/[id]/refund/route.ts
import { stripe } from '@/lib/stripe/server';

export async function POST(request: NextRequest, { params }) {
  const { id } = await params;

  // Get booking with charge ID
  const { data: booking } = await supabase
    .from('bookings')
    .select('stripe_charge_id, payment_amount')
    .eq('id', id)
    .single();

  if (!booking?.stripe_charge_id) {
    return NextResponse.json({ error: 'No charge found' }, { status: 400 });
  }

  // Create refund
  const refund = await stripe.refunds.create({
    charge: booking.stripe_charge_id,
    // amount: optional, omit for full refund
  });

  // Status will be updated via webhook (charge.refunded)
  return NextResponse.json({ refund });
}
```

---

## FILES TO CREATE/MODIFY

| Action | File | Purpose |
|--------|------|---------|
| CREATE | `lib/stripe/server.ts` | Server-side Stripe client |
| CREATE | `lib/stripe/client.ts` | Client-side Stripe loader |
| CREATE | `app/api/bookings/create-payment-intent/route.ts` | Create PaymentIntent |
| CREATE | `app/api/webhooks/stripe/route.ts` | Handle Stripe webhooks |
| CREATE | `app/api/bookings/[id]/status/route.ts` | Check booking status |
| CREATE | `components/booking/StripeProvider.tsx` | Stripe Elements wrapper |
| CREATE | `components/booking/PaymentForm.tsx` | Card input form |
| MODIFY | `components/booking/BookingForm.tsx` | Integrate payment step |
| MODIFY | `src/types/booking.ts` | Add payment types |
| MODIFY | Database | Add payment columns |

---

## DEVELOPMENT ORDER

**Recommended sequence:**

1. **Session 1:** Setup Stripe account, install packages, add env vars
2. **Session 2:** Database migration, update types, create API routes
3. **Session 3:** Frontend components (StripeProvider, PaymentForm)
4. **Session 4:** Integration with BookingForm, test with Stripe CLI
5. **Session 5:** Polish error handling, go to production

---

## IMPORTANT NOTES

- **Test mode first:** Always develop and test with `pk_test_` / `sk_test_` keys
- **Webhook is critical:** Don't rely on frontend for payment confirmation
- **Idempotency:** Use booking ID as idempotency key to prevent double charges
- **Timeout handling:** PaymentIntents expire after 24 hours by default
- **Currency:** Always use EUR (cents) for this project
- **PCI Compliance:** Using Stripe Elements keeps you PCI compliant (SAQ A)

---

## STRIPE DASHBOARD URLS

- **Test Mode:** https://dashboard.stripe.com/test/
- **Live Mode:** https://dashboard.stripe.com/
- **API Keys:** https://dashboard.stripe.com/apikeys
- **Webhooks:** https://dashboard.stripe.com/webhooks
- **Payments:** https://dashboard.stripe.com/payments
- **Customers:** https://dashboard.stripe.com/customers

---

## CONTACT & SUPPORT

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe API Reference:** https://stripe.com/docs/api
- **Stripe CLI:** https://stripe.com/docs/stripe-cli
- **Stripe Discord:** https://discord.gg/stripe
