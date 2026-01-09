"use client";

// src/components/booking/BookingCalendar.tsx - Continuous Date Selection with i18n
import React, { useState } from 'react';
import { format, addDays, differenceInDays, isAfter, isBefore, isWithinInterval } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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

const defaultTranslations: BookingCalendarTranslations = {
  selectCheckIn: "Select check-in date",
  selectCheckOut: "Select check-out date",
  selectDates: "Select dates",
  selectCheckoutDate: "Select checkout",
  clearDates: "Clear dates",
  night: "night",
  nights: "nights",
  minimumNightsRequired: "Minimum {min} nights required"
};

interface BookingCalendarProps {
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  onCheckInSelect: (date: Date | undefined) => void;
  onCheckOutSelect: (date: Date | undefined) => void;
  unavailableDates?: Date[];
  minStay?: number;
  className?: string;
  translations?: BookingCalendarTranslations;
  lang?: string;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  checkIn,
  checkOut,
  onCheckInSelect,
  onCheckOutSelect,
  unavailableDates = [],
  minStay = 1,
  className,
  translations = defaultTranslations,
  lang = 'en'
}) => {
  const t = translations;
  const locale = lang === 'it' ? it : enUS;
  const [isOpen, setIsOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'check-in' | 'check-out'>('check-in');

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(unavailableDate =>
      date.toDateString() === unavailableDate.toDateString()
    );
  };

  const isDateInRange = (date: Date) => {
    if (!checkIn || !checkOut) return false;
    return isWithinInterval(date, { start: checkIn, end: checkOut });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (selectionMode === 'check-in' || !checkIn) {
      onCheckInSelect(date);
      onCheckOutSelect(undefined);
      setSelectionMode('check-out');
    } else if (selectionMode === 'check-out') {
      if (isBefore(date, checkIn)) {
        onCheckInSelect(date);
        onCheckOutSelect(checkIn);
      } else if (date <= addDays(checkIn, minStay - 1)) {
        onCheckOutSelect(addDays(checkIn, minStay));
      } else {
        onCheckOutSelect(date);
      }
      setIsOpen(false);
      setSelectionMode('check-in');
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectionMode('check-in');
    }
  };

  const handleClearDates = () => {
    onCheckInSelect(undefined);
    onCheckOutSelect(undefined);
    setSelectionMode('check-in');
  };

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;

  const getButtonText = () => {
    if (checkIn && checkOut) {
      return `${format(checkIn, "dd MMM", { locale })} - ${format(checkOut, "dd MMM", { locale })}`;
    } else if (checkIn) {
      return `${format(checkIn, "dd MMM", { locale })} - ${t.selectCheckoutDate}`;
    } else {
      return t.selectDates;
    }
  };

  const getButtonVariant = (): "default" | "outline" | "destructive" | "secondary" | "ghost" | "link" | "terracotta" | "sage-outline" | "stone" => {
    if (checkIn && !checkOut) return "outline";
    return "outline";
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {selectionMode === 'check-in' ? t.selectCheckIn : t.selectCheckOut}
        </label>

        <Popover open={isOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant={getButtonVariant()}
              className={cn(
                "w-full justify-start text-left font-normal h-12 border-2 hover:border-sage focus:border-sage transition-colors",
                !checkIn && "text-muted-foreground",
                checkIn && !checkOut && "border-sage bg-sage/5"
              )}
            >
              <CalendarIcon size={18} className="mr-3 text-sage" />
              {getButtonText()}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0 z-50" align="start">
            <div className="p-3">
              <Calendar
                mode="single"
                selected={selectionMode === 'check-in' ? checkIn : checkOut}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  return (
                    date < new Date() ||
                    isDateUnavailable(date) ||
                    date > addDays(new Date(), 365) ||
                    !!(selectionMode === 'check-out' && checkIn && date <= checkIn) ||
                    !!(selectionMode === 'check-out' && checkIn && date < addDays(checkIn, minStay))
                  );
                }}
                weekStartsOn={1}
                locale={locale}
                initialFocus
                className="pointer-events-auto"
                modifiers={{
                  unavailable: unavailableDates,
                  inRange: isDateInRange
                }}
                modifiersStyles={{
                  unavailable: {
                    color: 'hsl(var(--destructive))',
                    textDecoration: 'line-through',
                    backgroundColor: 'hsl(var(--destructive) / 0.1)',
                    opacity: 0.5
                  },
                  inRange: {
                    backgroundColor: '#e6e8d9'
                  }
                }}
              />

              {(checkIn || checkOut) && (
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearDates}
                    className="text-muted-foreground hover:text-destructive w-full"
                  >
                    {t.clearDates}
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {nights > 0 && (
        <div className="text-center p-3 bg-stone-light rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-sage">{nights} {nights > 1 ? t.nights : t.night}</span>
            {minStay > 1 && nights < minStay && (
              <span className="text-destructive ml-2">
                ({t.minimumNightsRequired.replace('{min}', String(minStay))})
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
