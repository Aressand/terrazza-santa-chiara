import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromiseCache: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromiseCache) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
      return null;
    }

    stripePromiseCache = loadStripe(publishableKey);
  }
  return stripePromiseCache;
};
