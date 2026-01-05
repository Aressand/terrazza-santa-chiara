// src/hooks/useBooking.ts - ENHANCED with minimum stay validation
import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getRoomId, type RoomType } from '@/utils/roomMapping';
import { useAvailabilityManagement } from '@/hooks/useAvailabilityManagement';
import type { 
  RoomData, 
  BookingFormData, 
  BookingSubmission, 
  BookingConfirmation,
  AvailabilityCheck,
  PricingCalculation,
  ConflictType,
  BlockType
} from '@/types/booking';
import { format, eachDayOfInterval, addDays, differenceInDays } from 'date-fns';

export const useRoomData = (roomType: RoomType) => {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const supabase = createClient();
        const roomId = getRoomId(roomType);
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (error) throw error;
        
        setRoomData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load room data');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomType]);

  return { roomData, loading, error };
};

const generateNightDates = (checkIn: Date, checkOut: Date): string[] => {
  const nightStartDates = eachDayOfInterval({ start: checkIn, end: checkOut })
    .slice(0, -1)
    .map(date => format(date, 'yyyy-MM-dd'));

  return nightStartDates;
};

const checkExistingBookings = async (
  supabase: any,
  roomId: string,
  checkInDate: string,
  nightDates: string[]
): Promise<ConflictType[]> => {
  const checkOutDate = nightDates.length > 0 
    ? format(addDays(new Date(nightDates[nightDates.length - 1]), 1), 'yyyy-MM-dd')
    : checkInDate;

  const { data: bookingConflicts, error } = await supabase
    .from('bookings')
    .select('check_in, check_out, guest_name')
    .eq('room_id', roomId)
    .eq('status', 'confirmed')
    .or(`and(check_in.lt.${checkOutDate},check_out.gt.${checkInDate})`);

  if (error) throw error;

  return (bookingConflicts || []).map(booking => ({
    type: 'booking' as const,
    check_in: booking.check_in,
    check_out: booking.check_out,
    guest_name: booking.guest_name
  }));
};

const checkCheckInDateBlocks = async (
  supabase: any,
  roomId: string,
  checkInDate: string
): Promise<ConflictType[]> => {
  const { data: blocks, error } = await supabase
    .from('room_availability')
    .select('date, block_type, is_available')
    .eq('room_id', roomId)
    .eq('date', checkInDate)
    .eq('is_available', false);

  if (error) throw error;

  return (blocks || []).map((block: any) => {
    const blockType: BlockType = block.block_type || 'full';
    
    let reason: string;
    switch (blockType) {
      case 'prep_before':
        reason = 'Check-in blocked by preparation time';
        break;
      case 'booking_guest':
        reason = 'Check-in blocked by Booking.com guest reservation';
        break;
      case 'full':
      default:
        reason = 'Check-in blocked by external calendar';
        break;
    }

    return {
      type: 'blocked' as const,
      date: block.date,
      block_type: blockType,
      reason
    };
  });
};

const checkNightDatesBlocks = async (
  supabase: any,
  roomId: string,
  nightDates: string[]
): Promise<ConflictType[]> => {
  const { data: blocks, error } = await supabase
    .from('room_availability')
    .select('date, block_type, is_available')
    .eq('room_id', roomId)
    .in('date', nightDates)
    .eq('is_available', false);

  if (error) throw error;

  const conflictingBlocks = (blocks || []).filter((block: any) => {
    const blockType: BlockType = block.block_type || 'full';
    return true; // All block types prevent night occupation
  });

  return conflictingBlocks.map((block: any) => {
    const blockType: BlockType = block.block_type || 'full';
    
    let reason: string;
    switch (blockType) {
      case 'booking_guest':
        reason = 'Night blocked by Booking.com guest reservation';
        break;
      case 'prep_before':
        reason = 'Night blocked by preparation period';
        break;
      case 'full':
      default:
        reason = 'Night blocked by external calendar';
        break;
    }

    return {
      type: 'blocked' as const,
      date: block.date,
      block_type: blockType,
      reason
    };
  });
};

// 🆕 NEW: Check minimum stay requirement
const checkMinimumStay = async (
  supabase: any,
  roomId: string,
  checkIn: Date,
  checkOut: Date
): Promise<ConflictType[]> => {
  try {
    // Get room minimum stay requirement
    const { data: roomData, error } = await supabase
      .from('rooms')
      .select('minimum_stay')
      .eq('id', roomId)
      .single();

    if (error) throw error;

    const nights = differenceInDays(checkOut, checkIn);
    const minimumStay = roomData?.minimum_stay || 2;

    if (nights < minimumStay) {
      return [{
        type: 'minimum_stay' as const,
        nights,
        required: minimumStay,
        reason: `Minimum stay requirement: ${minimumStay} nights (selected: ${nights})`
      }];
    }

    return [];
  } catch {
    return []; // Silent fail - don't block bookings on error
  }
};

const checkNightBasedConflicts = async (
  supabase: any,
  roomId: string,
  checkInDate: string,
  nightDates: string[]
): Promise<ConflictType[]> => {
  const allConflicts: ConflictType[] = [];

  // Check existing bookings
  const bookingConflicts = await checkExistingBookings(supabase, roomId, checkInDate, nightDates);
  allConflicts.push(...bookingConflicts);

  // Check check-in date blocks
  const checkInConflicts = await checkCheckInDateBlocks(supabase, roomId, checkInDate);
  allConflicts.push(...checkInConflicts);

  // Check night date blocks
  if (nightDates.length > 0) {
    const nightConflicts = await checkNightDatesBlocks(supabase, roomId, nightDates);
    allConflicts.push(...nightConflicts);
  }

  return allConflicts;
};

export const useAvailabilityCheck = () => {
  const [checking, setChecking] = useState(false);

  const checkAvailability = useCallback(async (
    roomType: RoomType,
    checkIn: Date,
    checkOut: Date
  ): Promise<AvailabilityCheck> => {
    try {
      setChecking(true);
      
      const supabase = createClient();
      const roomId = getRoomId(roomType);
      const checkInStr = format(checkIn, 'yyyy-MM-dd');
      const nightDates = generateNightDates(checkIn, checkOut);
      
      // 🆕 NEW: Check minimum stay requirement FIRST
      const minimumStayConflicts = await checkMinimumStay(supabase, roomId, checkIn, checkOut);
      
      // If minimum stay not met, return early with conflict
      if (minimumStayConflicts.length > 0) {
        return {
          isAvailable: false,
          conflicts: minimumStayConflicts
        };
      }
      
      // Continue with standard conflict checking
      const conflicts = await checkNightBasedConflicts(supabase, roomId, checkInStr, nightDates);
      const isAvailable = conflicts.length === 0;

      return {
        isAvailable,
        conflicts
      };
    } catch (err) {
      return {
        isAvailable: false,
        conflicts: []
      };
    } finally {
      setChecking(false);
    }
  }, []);

  return { checkAvailability, checking };
};

export const usePricingCalculation = (roomType: RoomType) => {
  const { getPriceForDate, roomData, loading } = useAvailabilityManagement(roomType);

  const calculatePricing = useCallback((
    checkIn: Date | null,
    checkOut: Date | null
  ): PricingCalculation | null => {
    if (!checkIn || !checkOut || !roomData || !getPriceForDate) {
      return null;
    }

    try {
      const stayDates = eachDayOfInterval({ start: checkIn, end: checkOut }).slice(0, -1);
      
      let roomTotal = 0;
      for (const date of stayDates) {
        roomTotal += getPriceForDate(date);
      }

      const nights = stayDates.length;
      const basePrice = roomTotal / nights;
      const cleaningFee = 0;
      const totalPrice = roomTotal + cleaningFee;

      return {
        basePrice,
        nights,
        roomTotal,
        cleaningFee,
        totalPrice,
        priceBreakdown: {
          nightlyRate: basePrice,
          totalNights: nights,
          subtotal: roomTotal,
          fees: cleaningFee,
          total: totalPrice
        }
      };
    } catch (error) {
      return null;
    }
  }, [roomData, getPriceForDate]);

  return { calculatePricing, loading };
};

export const useCreateBooking = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = useCallback(async (
    roomType: RoomType,
    checkIn: Date,
    checkOut: Date,
    formData: BookingFormData,
    pricing: PricingCalculation
  ): Promise<BookingConfirmation> => {
    try {
      setSubmitting(true);
      setError(null);

      const supabase = createClient();
      const roomId = getRoomId(roomType);
      
      const bookingData: BookingSubmission = {
        room_id: roomId,
        check_in: format(checkIn, 'yyyy-MM-dd'),
        check_out: format(checkOut, 'yyyy-MM-dd'),
        guest_name: `${formData.firstName} ${formData.lastName}`,
        guest_email: formData.email,
        guest_phone: formData.phone,
        guest_country: formData.country,
        guests_count: parseInt(formData.guests),
        total_nights: pricing.nights,
        total_price: pricing.totalPrice,
        special_requests: formData.specialRequests,
        status: 'confirmed'
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      const confirmation: BookingConfirmation = {
        id: data.id,
        confirmation_number: data.id.slice(0, 8).toUpperCase(),
        guest_name: data.guest_name,
        guest_email: data.guest_email,
        room_name: 'Room', // This would be fetched from room data
        check_in: data.check_in,
        check_out: data.check_out,
        total_nights: data.total_nights,
        total_price: data.total_price,
        guests_count: data.guests_count,
        special_requests: data.special_requests,
        status: data.status,
        created_at: data.created_at
      };

      return confirmation;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { createBooking, submitting, error };
};
