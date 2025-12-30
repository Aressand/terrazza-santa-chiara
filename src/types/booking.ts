// src/types/booking.ts - ENHANCED with minimum stay support

export interface RoomData {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  high_season_price: number;
  capacity: number;
  minimum_stay: number; // 🆕 Added minimum stay requirement
  description: string | null;
  short_description: string | null;
  amenities: any;
  features: any;
  images: any;
  is_active: boolean;
  created_at: string;
}

export interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  guests: string;
  specialRequests: string;
  agreeToTerms: boolean;
}

export interface BookingSubmission {
  room_id: string;
  check_in: string;  // ISO date string
  check_out: string; // ISO date string
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_country: string;
  guests_count: number;
  total_nights: number;
  total_price: number;
  special_requests: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface BookingConfirmation {
  id: string;
  confirmation_number: string;
  guest_name: string;
  guest_email: string;
  room_name: string;
  check_in: string;
  check_out: string;
  total_nights: number;
  total_price: number;
  guests_count: number;
  special_requests: string;
  status: string;
  created_at: string;
}

// Platform-aware conflict types with minimum stay support
export interface BookingConflict {
  type: 'booking';
  check_in: string;
  check_out: string;
  guest_name?: string;
}

export interface BlockedDateConflict {
  type: 'blocked';
  date: string;
  block_type?: BlockType;
  reason: string;
}

// 🆕 New conflict type for minimum stay validation
export interface MinimumStayConflict {
  type: 'minimum_stay';
  nights: number;
  required: number;
  reason: string;
}

// Enhanced block types
export type BlockType = 
  | 'full'           // Complete block - no check-in or checkout allowed
  | 'prep_before'    // Preparation block - blocks check-in, allows checkout
  | 'booking_guest'  // Booking.com guest - allows same-day turnover
  | 'airbnb_guest';  // Future: Airbnb-specific if needed

export type ConflictType = BookingConflict | BlockedDateConflict | MinimumStayConflict;

// Availability check result interface
export interface AvailabilityCheck {
  isAvailable: boolean;
  conflicts: ConflictType[];
}

export interface PricingCalculation {
  basePrice: number;
  nights: number;
  roomTotal: number;
  cleaningFee: number;
  totalPrice: number;
  priceBreakdown: {
    nightlyRate: number;
    totalNights: number;
    subtotal: number;
    fees: number;
    total: number;
  };
}

// Platform-aware availability record
export interface AvailabilityRecord {
  room_id: string;
  date: string;
  is_available: boolean;
  block_type: BlockType;
  created_at: string;
  platform_source?: string; // Optional: track which platform created the block
}