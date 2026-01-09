"use client";

// src/components/booking/BookingWidget.tsx - ENHANCED with minimum stay validation

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BookingCalendar from './BookingCalendar';
import BookingForm from './BookingForm';
import { differenceInDays } from "date-fns";
import { Users, Check, AlertCircle, Loader2 } from 'lucide-react';
import {
  useRoomData,
  useAvailabilityCheck,
  usePricingCalculation
} from '@/hooks/useBooking';
import { useRoomUnavailableDates } from '@/hooks/useRoomUnavailableDates';
import type { RoomType } from '@/utils/roomMapping';
import type { BookingConfirmation, ConflictType } from '@/types/booking';
import { format } from 'date-fns';

interface BookingWidgetTranslations {
  bookYourStay: string;
  from: string;
  perNight: string;
  upTo: string;
  guests: string;
  selectDates: string;
  invalidDates: string;
  minimumNights: string;
  datesUnavailable: string;
  reserve: string;
  checking: string;
  loading: string;
  youWontBeCharged: string;
  avg: string;
  night: string;
  nights: string;
  cleaningFee: string;
  total: string;
  bookingConfirmed: string;
  confirmation: string;
  guest: string;
  room: string;
  bookAnother: string;
  completeBooking: string;
}

interface BookingCalendarTranslations {
  selectCheckIn: string;
  selectCheckOut: string;
  selectDates: string;
  selectCheckoutDate: string;
  clearDates: string;
  night: string;
  nights: string;
  minimumNightsRequired: string;
}

interface BookingFormTranslations {
  guestDetails: string;
  numberOfGuests: string;
  oneGuest: string;
  twoGuests: string;
  yourStaySummary: string;
  room: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  night: string;
  nights: string;
  total: string;
  contactInformation: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  selectCountry: string;
  phone: string;
  phoneOptional: string;
  specialRequests: string;
  specialRequestsPlaceholder: string;
  paymentConfirmation: string;
  bookingSummary: string;
  guest: string;
  totalAmount: string;
  paymentMethod: string;
  proceedToPayment: string;
  preparingPayment: string;
  clickToProceed: string;
  agreeToTerms: string;
  agreeToTermsDescription: string;
  paymentDetails: string;
  cancel: string;
  previous: string;
  next: string;
  pay: string;
  processing: string;
  securedByStripe: string;
  enterFirstName: string;
  enterLastName: string;
  enterEmail: string;
  enterPhone: string;
  firstNameRequired: string;
  lastNameRequired: string;
  emailRequired: string;
  emailInvalid: string;
  countryRequired: string;
  guestsRequired: string;
  termsRequired: string;
}

interface BookingWidgetProps {
  roomType: RoomType;
  roomName: string;
  capacity: number;
  className?: string;
  presetCheckIn?: Date;
  presetCheckOut?: Date;
  presetGuests?: number;
  translations?: BookingWidgetTranslations;
  calendarTranslations?: BookingCalendarTranslations;
  formTranslations?: BookingFormTranslations;
  lang?: string;
}

// 🆕 ENHANCED: Conflict message generation with minimum stay support
const generateConflictMessage = (conflicts: ConflictType[]): string => {
  const bookingConflicts = conflicts.filter(c => c.type === 'booking');
  const blockedConflicts = conflicts.filter(c => c.type === 'blocked');
  const minimumStayConflicts = conflicts.filter(c => c.type === 'minimum_stay');
  
  const messages: string[] = [];
  
  // Handle minimum stay conflicts first (most important)
  if (minimumStayConflicts.length > 0) {
    const conflict = minimumStayConflicts[0];
    if ('required' in conflict && 'nights' in conflict) {
      return `Minimum stay: ${conflict.required} nights required (${conflict.nights} selected)`;
    }
  }
  
  if (bookingConflicts.length > 0) {
    messages.push(`${bookingConflicts.length} existing booking${bookingConflicts.length > 1 ? 's' : ''}`);
  }
  
  if (blockedConflicts.length > 0) {
    const blockedDates = blockedConflicts.map(c => 'date' in c ? c.date : '').filter(Boolean);
    messages.push(`${blockedConflicts.length} blocked date${blockedConflicts.length > 1 ? 's' : ''} (${blockedDates.slice(0, 3).join(', ')}${blockedDates.length > 3 ? '...' : ''})`);
  }
  
  return messages.length > 0 ? `Selected dates unavailable: ${messages.join(' and ')}.` : 'Selected dates are not available.';
};

// Default English translations for backwards compatibility
const defaultTranslations: BookingWidgetTranslations = {
  bookYourStay: "Book Your Stay",
  from: "from",
  perNight: "/night",
  upTo: "up to",
  guests: "guests",
  selectDates: "Select Dates",
  invalidDates: "Invalid Dates",
  minimumNights: "Minimum {min} nights required",
  datesUnavailable: "Dates Unavailable",
  reserve: "Reserve for",
  checking: "Checking...",
  loading: "Loading booking options...",
  youWontBeCharged: "You won't be charged yet",
  avg: "avg",
  night: "night",
  nights: "nights",
  cleaningFee: "Cleaning fee",
  total: "Total",
  bookingConfirmed: "Booking Confirmed!",
  confirmation: "Confirmation",
  guest: "Guest",
  room: "Room",
  bookAnother: "Book Another Stay",
  completeBooking: "Complete Your Booking",
};

const BookingWidget: React.FC<BookingWidgetProps> = ({
  roomType,
  roomName,
  capacity,
  className,
  presetCheckIn,
  presetCheckOut,
  presetGuests,
  translations = defaultTranslations,
  calendarTranslations,
  formTranslations,
  lang = 'en'
}) => {
  const t = translations;
  // State management (keeping original structure)
  const [checkIn, setCheckIn] = useState<Date | null>(presetCheckIn || null);
  const [checkOut, setCheckOut] = useState<Date | null>(presetCheckOut || null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<BookingConfirmation | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Hooks (keeping original structure)
  const { roomData, loading: roomLoading, error: roomError } = useRoomData(roomType);
  const { unavailableDates, loading: unavailabilityLoading } = useRoomUnavailableDates(roomType);
  const { checkAvailability, checking } = useAvailabilityCheck();
  const { calculatePricing, loading: pricingLoading } = usePricingCalculation(roomType);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Derived state (keeping original + adding minimum stay)
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const pricing = calculatePricing(checkIn, checkOut);
  
  // 🆕 NEW: Minimum stay validation
  const minimumStay = roomData?.minimum_stay || 2;
  const meetsMinimumStay = nights >= minimumStay;
  
  const canBook = checkIn && checkOut && nights > 0 && meetsMinimumStay && !availabilityError && roomData && pricing;

  // Availability checking (enhanced with minimum stay awareness)
  useEffect(() => {
    const checkDatesAvailability = async () => {
      if (!checkIn || !checkOut || nights <= 0) {
        setAvailabilityError(null);
        return;
      }

      // Don't check backend availability if minimum stay not met (handle in UI)
      if (!meetsMinimumStay) {
        setAvailabilityError(`Minimum stay: ${minimumStay} nights required (${nights} selected)`);
        return;
      }

      try {
        const result = await checkAvailability(roomType, checkIn, checkOut);
        
        if (!result.isAvailable) {
          const errorMessage = result.conflicts && result.conflicts.length > 0 
            ? generateConflictMessage(result.conflicts)
            : 'Selected dates are not available for booking.';
          
          setAvailabilityError(errorMessage);
        } else {
          setAvailabilityError(null);
        }
      } catch (error) {
        console.error('Error checking availability:', error);
        setAvailabilityError('Unable to check availability. Please try again.');
      }
    };

    checkDatesAvailability();
  }, [checkIn, checkOut, nights, meetsMinimumStay, minimumStay, roomType, checkAvailability]);

  // Event handlers (keeping original structure)
  const handleBookingStart = () => {
    if (!canBook) return;
    setBookingError(null);
    setIsBookingOpen(true);
  };

  const handleBookingComplete = async (bookingId: string) => {
    if (!checkIn || !checkOut || !pricing) return;

    // Fetch the booking details to show confirmation
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`);
      const booking = await response.json();

      if (booking && !booking.error) {
        setBookingConfirmation({
          id: booking.id,
          confirmation_number: booking.id.substring(0, 8).toUpperCase(),
          guest_name: booking.guest_name,
          guest_email: booking.guest_email,
          room_name: roomName,
          check_in: booking.check_in,
          check_out: booking.check_out,
          total_nights: booking.total_nights,
          total_price: booking.total_price,
          guests_count: 2,
          special_requests: '',
          status: booking.status,
          created_at: new Date().toISOString(),
        });
        setIsBookingComplete(true);
        setIsBookingOpen(false);
      }
    } catch (error) {
      console.error('Failed to fetch booking details:', error);
      // Still show success since payment went through
      setIsBookingComplete(true);
      setIsBookingOpen(false);
    }
  };

  const handleBookingCancel = () => {
    setIsBookingOpen(false);
  };

  const handleNewBooking = () => {
    setIsBookingComplete(false);
    setBookingConfirmation(null);
    setCheckIn(null);
    setCheckOut(null);
    setAvailabilityError(null);
  };

  // Loading state (keeping original)
  if (roomLoading || pricingLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">{t.loading}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state (keeping original)
  if (roomError) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{roomError}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Booking complete state (keeping original)
  if (isBookingComplete && bookingConfirmation) {
    return (
      <Card className={`${className} border-green-200 bg-green-50`}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-white" />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                {t.bookingConfirmed}
              </h3>
              <p className="text-sm text-green-700 mb-4">
                {t.confirmation}: <span className="font-mono font-semibold">
                  {bookingConfirmation.confirmation_number}
                </span>
              </p>

              <div className="bg-white rounded-lg p-4 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t.guest}:</span>
                  <span className="text-sm font-medium">{bookingConfirmation.guest_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t.room}:</span>
                  <span className="text-sm font-medium">{bookingConfirmation.room_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t.total}:</span>
                  <span className="text-sm font-semibold text-green-700">
                    €{bookingConfirmation.total_price}
                  </span>
                </div>
              </div>
            </div>

            <Button onClick={handleNewBooking} variant="outline" size="sm">
              {t.bookAnother}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main widget interface (keeping original structure)
  return (
    <Card className={className}>
      <CardContent className="p-6">
        {/* Header section (keeping original) */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">{t.bookYourStay}</h3>
            {roomData && (
              <span className="text-sm text-muted-foreground">
                {t.from} €{roomData.base_price}{t.perNight}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{t.upTo} {capacity} {t.guests}</span>
          </div>
        </div>

        {/* Calendar section (keeping original structure) */}
        <div className="space-y-4 mb-6">
          <BookingCalendar
            checkIn={checkIn ?? undefined}
            checkOut={checkOut ?? undefined}
            onCheckInSelect={(date) => setCheckIn(date ?? null)}
            onCheckOutSelect={(date) => setCheckOut(date ?? null)}
            unavailableDates={unavailableDates}
            minStay={1}
            translations={calendarTranslations}
            lang={lang}
          />
          
          {/* Nights and pricing display with detailed breakdown */}
          {checkIn && checkOut && nights > 0 && pricing && (
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  €{Math.round(pricing.basePrice)} {t.avg} × {nights} {nights > 1 ? t.nights : t.night}
                </span>
                <span className="font-medium">€{pricing.roomTotal}</span>
              </div>

              {pricing.cleaningFee > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{t.cleaningFee}</span>
                  <span className="font-medium">€{pricing.cleaningFee}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="font-semibold">{t.total}</span>
                <span className="font-bold">€{pricing.totalPrice}</span>
              </div>
            </div>
          )}
        </div>

        {/* Error messages (enhanced with minimum stay) */}
        {availabilityError && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{availabilityError}</AlertDescription>
          </Alert>
        )}

        {bookingError && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{bookingError}</AlertDescription>
          </Alert>
        )}

        {/* Booking button (keeping original structure + minimum stay logic) */}
        <Button
          onClick={handleBookingStart}
          disabled={!canBook || checking || pricingLoading}
          variant="terracotta"
          className="w-full mb-2"
        >
          {checking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.checking}
            </>
          ) : !checkIn || !checkOut ? (
            t.selectDates
          ) : nights <= 0 ? (
            t.invalidDates
          ) : !meetsMinimumStay ? (
            t.minimumNights.replace('{min}', String(minimumStay))
          ) : availabilityError ? (
            t.datesUnavailable
          ) : (
            `${t.reserve} €${pricing?.totalPrice || 0}`
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          {t.youWontBeCharged}
        </p>
      </CardContent>

      {/* Booking dialog (keeping original) */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.completeBooking}</DialogTitle>
          </DialogHeader>

          {roomData && checkIn && checkOut && (
            <BookingForm
              roomId={roomData.id}
              roomName={roomName}
              checkIn={format(checkIn, 'yyyy-MM-dd')}
              checkOut={format(checkOut, 'yyyy-MM-dd')}
              nights={nights}
              totalPrice={pricing?.totalPrice || 0}
              onComplete={handleBookingComplete}
              onCancel={handleBookingCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default BookingWidget;