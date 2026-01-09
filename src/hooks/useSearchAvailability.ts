// src/hooks/useSearchAvailability.ts - Search availability with dynamic pricing

import { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format, eachDayOfInterval } from 'date-fns';
import { ROOM_MAPPING } from '@/utils/roomMapping';

interface RoomWithAvailabilityAndPricing {
  id: string;
  name: string;
  base_price: number;
  capacity: number;
  slug: string;
  roomType: string;
  isAvailable: boolean;
  dynamicPrice?: number;
  pricePerNight?: number;
  hasOverrides?: boolean;
  priceBreakdown?: Array<{
    date: string;
    price: number;
    isOverride: boolean;
  }>;
}

interface UseSearchAvailabilityProps {
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
}

const isHighSeason = (date: Date): boolean => {
  const month = date.getMonth() + 1;
  return month >= 6 && month <= 9;
};

const getRoomSlugById = (roomId: string): string => {
  const roomTypeEntry = Object.entries(ROOM_MAPPING).find(([, id]) => id === roomId);

  if (roomTypeEntry) {
    const roomType = roomTypeEntry[0];
    const slugMap: { [key: string]: string } = {
      garden: 'garden-room',
      terrace: 'terrace-apartment',
      modern: 'modern-apartment',
      stone: 'stone-vault-apartment'
    };
    return slugMap[roomType] || 'unknown-room';
  }

  return 'unknown-room';
};

export const useSearchAvailability = ({ checkIn, checkOut, guests }: UseSearchAvailabilityProps) => {
  const [rooms, setRooms] = useState<RoomWithAvailabilityAndPricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const searchParams = useMemo(() => {
    if (!checkIn || !checkOut || checkIn >= checkOut) {
      return null;
    }

    return {
      checkInStr: format(checkIn, 'yyyy-MM-dd'),
      checkOutStr: format(checkOut, 'yyyy-MM-dd'),
      guests
    };
  }, [checkIn?.getTime(), checkOut?.getTime(), guests]);

  const lastFetchedParams = useRef<string | null>(null);
  const currentParamsKey = searchParams ? JSON.stringify(searchParams) : null;

  useEffect(() => {
    if (!searchParams) {
      setRooms([]);
      setLoading(false);
      return;
    }

    if (lastFetchedParams.current === currentParamsKey) {
      return;
    }

    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      lastFetchedParams.current = currentParamsKey;

      try {
        const { data: allRooms, error: roomsError } = await supabase
          .from('rooms')
          .select('*')
          .eq('is_active', true)
          .gte('capacity', searchParams.guests);

        if (roomsError) {
          throw roomsError;
        }

        if (!allRooms || allRooms.length === 0) {
          setRooms([]);
          setLoading(false);
          return;
        }

        const dateRange = eachDayOfInterval({ start: checkIn!, end: checkOut! });
        const stayDates = dateRange.slice(0, -1);
        const dateStrings = dateRange.map(date => format(date, 'yyyy-MM-dd'));

        const roomsWithAvailabilityAndPricing: RoomWithAvailabilityAndPricing[] = [];

        for (const room of allRooms) {
          const roomSlug = getRoomSlugById(room.id);
          const roomTypeEntry = Object.entries(ROOM_MAPPING).find(([, id]) => id === room.id);
          const roomType = roomTypeEntry ? roomTypeEntry[0] : 'unknown';

          try {
            let isAvailable = true;
            let dynamicPrice: number | undefined;
            let pricePerNight: number | undefined;
            let hasOverrides = false;
            let priceBreakdown: Array<{date: string; price: number; isOverride: boolean}> = [];

            const { data: conflictingBookings, error: bookingError } = await supabase
              .from('bookings')
              .select('check_in, check_out, guests_count')
              .eq('room_id', room.id)
              .eq('status', 'confirmed')
              .or(`and(check_in.lt.${searchParams.checkOutStr},check_out.gt.${searchParams.checkInStr})`);

            if (bookingError) throw bookingError;

            if (conflictingBookings && conflictingBookings.length > 0) {
              isAvailable = false;
            }

            let availabilityBlocks: { date: string; is_available: boolean; price_override: number | null }[] = [];
            if (isAvailable) {
              const { data: blocks, error: availError } = await supabase
                .from('room_availability')
                .select('date, is_available, price_override')
                .eq('room_id', room.id)
                .in('date', dateStrings);

              if (availError) throw availError;

              availabilityBlocks = blocks || [];

              const blockedDates = availabilityBlocks.filter(block => !block.is_available);
              if (blockedDates.length > 0) {
                isAvailable = false;
              }
            }

            if (isAvailable) {
              priceBreakdown = stayDates.map(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const override = availabilityBlocks.find(block =>
                  block.date === dateStr && block.price_override
                );

                const basePrice = isHighSeason(date) ? (room.high_season_price || room.base_price) : room.base_price;
                const finalPrice = override?.price_override || basePrice;

                if (override?.price_override) {
                  hasOverrides = true;
                }

                return {
                  date: dateStr,
                  price: finalPrice,
                  isOverride: !!override?.price_override
                };
              });

              dynamicPrice = priceBreakdown.reduce((sum, day) => sum + day.price, 0);
              pricePerNight = priceBreakdown.length > 0 ? dynamicPrice / priceBreakdown.length : room.base_price;
            } else {
              pricePerNight = room.base_price;
            }

            roomsWithAvailabilityAndPricing.push({
              id: room.id,
              name: room.name,
              base_price: room.base_price,
              capacity: room.capacity,
              slug: roomSlug,
              roomType,
              isAvailable,
              dynamicPrice,
              pricePerNight: pricePerNight || room.base_price,
              hasOverrides,
              priceBreakdown
            });

          } catch (err) {
            roomsWithAvailabilityAndPricing.push({
              id: room.id,
              name: room.name,
              base_price: room.base_price,
              capacity: room.capacity,
              slug: roomSlug,
              roomType,
              isAvailable: false,
              pricePerNight: room.base_price
            });
          }
        }

        setRooms(roomsWithAvailabilityAndPricing);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load rooms');
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();

  }, [searchParams, currentParamsKey, supabase, checkIn, checkOut]);

  const availableRooms = rooms.filter(room => room.isAvailable);
  const unavailableRooms = rooms.filter(room => !room.isAvailable);

  return {
    allRooms: rooms,
    availableRooms,
    unavailableRooms,
    loading,
    error,
    refetch: () => {
      lastFetchedParams.current = null;
      setLoading(true);
    }
  };
};
