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
  dict: {
    pay: string;
    processing: string;
    securedByStripe: string;
  };
}

export function PaymentForm({
  bookingId,
  totalPrice,
  onSuccess,
  onError,
  dict,
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
        const message = getErrorMessage(error.code || '', error.message);
        setErrorMessage(message);
        onError(message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      const message = 'An unexpected error occurred';
      setErrorMessage(message);
      onError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
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
        className="w-full bg-sage hover:bg-sage/90 text-white py-3"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {dict.processing}
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            {dict.pay} €{totalPrice.toFixed(2)}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
        <Lock className="h-3 w-3" />
        {dict.securedByStripe}
      </p>
    </form>
  );
}

function getErrorMessage(code: string, defaultMessage?: string): string {
  const messages: Record<string, string> = {
    card_declined: 'Your card was declined. Please try a different card.',
    expired_card: 'Your card has expired. Please use a different card.',
    incorrect_cvc: 'The CVC code is incorrect. Please check and try again.',
    processing_error:
      'An error occurred processing your card. Please try again.',
    insufficient_funds: 'Insufficient funds. Please try a different card.',
    incorrect_number: 'The card number is incorrect. Please check and try again.',
  };
  return messages[code] || defaultMessage || 'An error occurred. Please try again.';
}
