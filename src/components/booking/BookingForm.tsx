"use client";

// src/components/booking/BookingForm.tsx - WITH STRIPE INTEGRATION

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, ArrowLeft, ArrowRight, CreditCard, Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { StripeProvider } from './StripeProvider';
import { PaymentForm } from './PaymentForm';
import { CreatePaymentIntentResponse } from '@/types/booking';

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  guests: string;
  specialRequests: string;
  agreeToTerms: boolean;
}

interface BookingFormProps {
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  nights: number;
  onComplete: (bookingId: string) => void;
  onCancel: () => void;
  className?: string;
}

const countries = [
  'Italy', 'United States', 'United Kingdom', 'Germany', 'France',
  'Spain', 'Netherlands', 'Canada', 'Australia', 'Switzerland',
  'Austria', 'Belgium', 'Other'
];

const BookingForm: React.FC<BookingFormProps> = ({
  roomId,
  roomName,
  checkIn,
  checkOut,
  totalPrice,
  nights,
  onComplete,
  onCancel,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState<CreatePaymentIntentResponse | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    guests: '2',
    specialRequests: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof BookingFormData, string>> = {};

    if (step === 1) {
      if (!formData.guests) newErrors.guests = 'Number of guests is required';
    }

    if (step === 2) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.country) newErrors.country = 'Country is required';
    }

    if (step === 3) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    if (currentStep === 3 && paymentData) {
      setPaymentData(null);
      setPaymentError(null);
    }
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleProceedToPayment = async () => {
    if (!validateStep(3)) return;

    setIsCreatingPayment(true);
    setPaymentError(null);

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
          guest_phone: formData.phone || undefined,
          guest_country: formData.country,
          guests_count: parseInt(formData.guests),
          total_price: totalPrice,
          special_requests: formData.specialRequests || undefined,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setPaymentError(data.error);
        return;
      }

      setPaymentData(data);
    } catch (error) {
      setPaymentError('Failed to initialize payment. Please try again.');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handlePaymentSuccess = () => {
    if (paymentData) {
      onComplete(paymentData.bookingId);
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  const updateFormData = (field: keyof BookingFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-playfair font-semibold mb-4">Guest Details</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="guests">Number of Guests</Label>
            <Select
              value={formData.guests}
              onValueChange={(value) => updateFormData('guests', value)}
            >
              <SelectTrigger className={cn("mt-1", errors.guests && "border-destructive")}>
                <div className="flex items-center">
                  <Users size={18} className="mr-2 text-sage" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Guest</SelectItem>
                <SelectItem value="2">2 Guests</SelectItem>
              </SelectContent>
            </Select>
            {errors.guests && <p className="text-destructive text-sm mt-1">{errors.guests}</p>}
          </div>

          <div className="bg-stone-light rounded-lg p-4">
            <h4 className="font-medium mb-2">Your Stay Summary</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Room:</span>
                <span>{roomName}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-in:</span>
                <span>{new Date(checkIn).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-out:</span>
                <span>{new Date(checkOut).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{nights} night{nights > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Total:</span>
                <span className="text-terracotta">€{totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-playfair font-semibold mb-4">Contact Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
              className={cn("mt-1", errors.firstName && "border-destructive")}
              placeholder="Enter your first name"
            />
            {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData('lastName', e.target.value)}
              className={cn("mt-1", errors.lastName && "border-destructive")}
              placeholder="Enter your last name"
            />
            {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              className={cn("mt-1", errors.email && "border-destructive")}
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="country">Country *</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => updateFormData('country', value)}
            >
              <SelectTrigger className={cn("mt-1", errors.country && "border-destructive")}>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && <p className="text-destructive text-sm mt-1">{errors.country}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
              className="mt-1"
              placeholder="+39 123 456 7890"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) => updateFormData('specialRequests', e.target.value)}
              className="mt-1"
              placeholder="Any special requests or dietary requirements..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-playfair font-semibold mb-4">Payment & Confirmation</h3>

        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="bg-stone-light rounded-lg p-4">
            <h4 className="font-medium mb-3">Booking Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Guest:</span>
                <span>{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span>{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Room:</span>
                <span>{roomName}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{nights} night{nights > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t pt-2 mt-3">
                <span>Total Amount:</span>
                <span className="text-terracotta">€{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => updateFormData('agreeToTerms', !!checked)}
                className={cn(errors.agreeToTerms && "border-destructive")}
              />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I agree to the terms and conditions
                </label>
                <p className="text-xs text-muted-foreground">
                  By checking this box, you agree to our booking terms, privacy policy, and cancellation policy.
                </p>
              </div>
            </div>
            {errors.agreeToTerms && <p className="text-destructive text-sm">{errors.agreeToTerms}</p>}
          </div>

          {/* Payment Error */}
          {paymentError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}

          {/* Payment Section */}
          {paymentData ? (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-sage" />
                <h4 className="font-medium">Payment Details</h4>
              </div>

              <StripeProvider clientSecret={paymentData.clientSecret}>
                <PaymentForm
                  bookingId={paymentData.bookingId}
                  totalPrice={totalPrice}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  dict={{
                    pay: 'Pay',
                    processing: 'Processing...',
                    securedByStripe: 'Secured by Stripe. Your card details are encrypted.',
                  }}
                />
              </StripeProvider>
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-sage" />
                <h4 className="font-medium">Payment Method</h4>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Click the button below to proceed to secure payment.
              </p>

              <Button
                onClick={handleProceedToPayment}
                disabled={!formData.agreeToTerms || isCreatingPayment}
                className="w-full bg-terracotta hover:bg-terracotta/90"
              >
                {isCreatingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-8", className)}>
      {/* Step Progress */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              currentStep === step
                ? "bg-sage text-white"
                : currentStep > step
                ? "bg-sage/20 text-sage"
                : "bg-gray-200 text-gray-500"
            )}>
              {currentStep > step ? <Check size={16} /> : step}
            </div>
            {step < 3 && (
              <div className={cn(
                "w-12 h-0.5 mx-2",
                currentStep > step ? "bg-sage" : "bg-gray-200"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      {/* Navigation Buttons */}
      {!paymentData && (
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onCancel : handlePrevious}
            className="flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>

          {currentStep < 3 && (
            <Button
              onClick={handleNext}
              className="flex items-center bg-sage hover:bg-sage/90"
            >
              Next
              <ArrowRight size={16} className="ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingForm;
