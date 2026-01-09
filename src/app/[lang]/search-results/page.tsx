"use client";

import { useSearchParams } from "next/navigation";
import { useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, differenceInDays, parseISO } from "date-fns";
import { Filter, Search, AlertCircle, CalendarX } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSearchAvailability } from "@/hooks/useSearchAvailability";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";
import { useEffect } from "react";

interface SearchResultsPageProps {
  params: Promise<{ lang: string }>;
}

export default function SearchResultsPage({ params }: SearchResultsPageProps) {
  const { lang } = use(params);
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const searchParams = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter states
  const [priceRange, setPriceRange] = useState("any");
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [specialFeatures, setSpecialFeatures] = useState<string[]>([]);

  useEffect(() => {
    getDictionary(lang as Locale).then(setDictionary);
  }, [lang]);

  // Parse URL parameters
  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');
  const guestsParam = searchParams.get('guests');

  const hasValidParams = checkInParam && checkOutParam && guestsParam;

  let checkInDate: Date | null = null;
  let checkOutDate: Date | null = null;
  let isValidDates = false;

  if (checkInParam && checkOutParam) {
    try {
      checkInDate = parseISO(checkInParam);
      checkOutDate = parseISO(checkOutParam);
      isValidDates = !isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime()) && checkOutDate > checkInDate;
    } catch {
      isValidDates = false;
    }
  }

  const guests = guestsParam ? parseInt(guestsParam) : 1;
  const nights = checkInDate && checkOutDate && isValidDates ? differenceInDays(checkOutDate, checkInDate) : 0;

  const {
    availableRooms,
    unavailableRooms,
    loading,
    error
  } = useSearchAvailability({
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests
  });

  const applyFilters = (rooms: typeof availableRooms) => {
    return rooms.filter(room => {
      if (priceRange !== "any") {
        const roomPricePerNight = room.pricePerNight || room.base_price;
        if (priceRange === "low" && (roomPricePerNight < 80 || roomPricePerNight > 120)) return false;
        if (priceRange === "medium" && (roomPricePerNight < 120 || roomPricePerNight > 160)) return false;
        if (priceRange === "high" && roomPricePerNight < 160) return false;
      }

      if (roomTypes.length > 0) {
        const roomCategory = room.roomType === 'garden' ? 'private-room' : 'full-apartment';
        if (!roomTypes.includes(roomCategory)) return false;
      }

      return true;
    });
  };

  const filteredRooms = applyFilters(availableRooms);

  const handleRoomTypeChange = (roomType: string, checked: boolean) => {
    if (checked) {
      setRoomTypes(prev => [...prev, roomType]);
    } else {
      setRoomTypes(prev => prev.filter(type => type !== roomType));
    }
  };

  const handleSpecialFeatureChange = (feature: string, checked: boolean) => {
    if (checked) {
      setSpecialFeatures(prev => [...prev, feature]);
    } else {
      setSpecialFeatures(prev => prev.filter(f => f !== feature));
    }
  };

  const clearAllFilters = () => {
    setPriceRange("any");
    setRoomTypes([]);
    setSpecialFeatures([]);
  };

  const hasActiveFilters = priceRange !== "any" || roomTypes.length > 0 || specialFeatures.length > 0;

  if (!dictionary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
      </div>
    );
  }

  const t = dictionary.searchResults;

  if (!hasValidParams) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-16">
          <Alert className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t.noResultsDescription}
            </AlertDescription>
          </Alert>
          <div className="text-center mt-8">
            <Link href={`/${lang}`}>
              <Button className="bg-terracotta hover:bg-terracotta/90">{dictionary.common.backToHome}</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!isValidDates) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-16">
          <Alert className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t.noResultsDescription}
            </AlertDescription>
          </Alert>
          <div className="text-center mt-8">
            <Link href={`/${lang}`}>
              <Button className="bg-terracotta hover:bg-terracotta/90">{dictionary.common.backToHome}</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <main className="container mx-auto px-4 py-8">
        {/* Search Summary Bar */}
        {checkInDate && checkOutDate && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-card border border-border rounded-lg">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">{format(checkInDate, 'MMM d')}</span>
                {' → '}
                <span className="font-medium">{format(checkOutDate, 'MMM d, yyyy')}</span>
              </div>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <div>{guests} {guests !== 1 ? t.guestPlural : t.guest}</div>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <div>{nights} {nights !== 1 ? t.nights : t.night}</div>
            </div>
            <Link href={`/${lang}`}>
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                {t.modifySearch}
              </Button>
            </Link>
          </div>
        )}
        {/* Results Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-playfair text-foreground mb-2">
            {loading ? t.loading :
             error ? 'Error' :
             `${availableRooms.length + unavailableRooms.length} ${availableRooms.length > 0 ? t.available : t.unavailable}`}
          </h1>
          {checkInDate && checkOutDate && (
            <p className="text-muted-foreground">
              {format(checkInDate, 'EEEE, MMMM d')} - {format(checkOutDate, 'EEEE, MMMM d, yyyy')} • {guests} {guests !== 1 ? t.guestPlural : t.guest} • {nights} {nights !== 1 ? t.nights : t.night}
            </p>
          )}
        </div>

        {error && (
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:col-span-1 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {/* Price Range */}
                <div>
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <RadioGroup value={priceRange} onValueChange={setPriceRange}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="any" id="any-price" />
                      <Label htmlFor="any-price">Any price</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="low-price" />
                      <Label htmlFor="low-price">€80 - €120</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium-price" />
                      <Label htmlFor="medium-price">€120 - €160</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="high-price" />
                      <Label htmlFor="high-price">€160+</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Accommodation Type */}
                <div>
                  <h4 className="font-medium mb-3">Accommodation Type</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="private-room"
                        checked={roomTypes.includes("private-room")}
                        onCheckedChange={(checked) => handleRoomTypeChange("private-room", !!checked)}
                      />
                      <Label htmlFor="private-room">Private Room</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="full-apartment"
                        checked={roomTypes.includes("full-apartment")}
                        onCheckedChange={(checked) => handleRoomTypeChange("full-apartment", !!checked)}
                      />
                      <Label htmlFor="full-apartment">Full Apartment</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Special Features */}
                <div>
                  <h4 className="font-medium mb-3">Special Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="private-garden"
                        checked={specialFeatures.includes("private-garden")}
                        onCheckedChange={(checked) => handleSpecialFeatureChange("private-garden", !!checked)}
                      />
                      <Label htmlFor="private-garden">Private Garden</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="panoramic-terrace"
                        checked={specialFeatures.includes("panoramic-terrace")}
                        onCheckedChange={(checked) => handleSpecialFeatureChange("panoramic-terrace", !!checked)}
                      />
                      <Label htmlFor="panoramic-terrace">Panoramic Terrace</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="historic-stone"
                        checked={specialFeatures.includes("historic-stone")}
                        onCheckedChange={(checked) => handleSpecialFeatureChange("historic-stone", !!checked)}
                      />
                      <Label htmlFor="historic-stone">Historic Stone Vault</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="modern-luxury"
                        checked={specialFeatures.includes("modern-luxury")}
                        onCheckedChange={(checked) => handleSpecialFeatureChange("modern-luxury", !!checked)}
                      />
                      <Label htmlFor="modern-luxury">Modern Luxury</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full justify-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {[priceRange !== "any" ? 1 : 0, roomTypes.length, specialFeatures.length]
                      .reduce((a, b) => a + b, 0)}
                  </Badge>
                )}
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
                    <div className="w-full aspect-video bg-gray-200" />
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-10 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300">
                {filteredRooms.map((room) => {
                  const displayPricePerNight = Math.round(room.pricePerNight || room.base_price);
                  const totalPrice = room.dynamicPrice || (displayPricePerNight * nights);

                  return (
                    <div
                      key={room.id}
                      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Room Image</span>
                      </div>

                      <div className="p-6">
                        <h3 className="font-playfair text-xl font-semibold text-card-foreground mb-2">
                          {room.name}
                          {room.hasOverrides && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Special Rate
                            </Badge>
                          )}
                        </h3>

                        <p className="text-muted-foreground mb-4">
                          {t.upTo} {room.capacity} {room.capacity !== 1 ? t.guestPlural : t.guest}
                        </p>

                        <div className="mb-4">
                          <p className="text-lg font-semibold text-foreground">
                            €{displayPricePerNight}{t.perNight}
                          </p>
                          {nights > 0 && (
                            <p className="text-sm text-muted-foreground">
                              €{Math.round(totalPrice)} {t.total} ({nights} {nights !== 1 ? t.nights : t.night})
                            </p>
                          )}
                        </div>

                        <Link
                          href={`/${lang}/rooms/${room.slug}?checkIn=${searchParams.get('checkIn') || ''}&checkOut=${searchParams.get('checkOut') || ''}&guests=${searchParams.get('guests') || ''}`}
                        >
                          <Button
                            className="w-full bg-terracotta hover:bg-terracotta/90"
                          >
                            {t.bookNow}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                {unavailableRooms.length > 0 ? (
                  <>
                    <CalendarX className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-card-foreground mb-4">
                      {t.noResults}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      {t.noResultsDescription}
                    </p>
                    <div className="space-y-2">
                      <Link href={`/${lang}`}>
                        <Button className="bg-terracotta hover:bg-terracotta/90 mr-4">
                          {t.modifySearch}
                        </Button>
                      </Link>
                      {hasActiveFilters && (
                        <Button variant="outline" onClick={clearAllFilters}>
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-card-foreground mb-4">
                      {t.noResults}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      {t.noResultsDescription}
                    </p>
                    <div className="space-y-2">
                      {hasActiveFilters && (
                        <Button className="bg-terracotta hover:bg-terracotta/90 mr-4" onClick={clearAllFilters}>
                          Clear All Filters
                        </Button>
                      )}
                      <Link href={`/${lang}`}>
                        <Button variant="outline">
                          {t.modifySearch}
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Show unavailable rooms if any */}
            {unavailableRooms.length > 0 && filteredRooms.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-semibold text-muted-foreground mb-6">
                  {t.unavailable} ({unavailableRooms.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
                  {unavailableRooms.map((room) => {
                    const displayPricePerNight = Math.round(room.pricePerNight || room.base_price);

                    return (
                      <div
                        key={room.id}
                        className="bg-card border border-border rounded-lg overflow-hidden"
                      >
                        <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">Room Image</span>
                        </div>

                        <div className="p-6">
                          <h3 className="font-playfair text-xl font-semibold text-card-foreground mb-2">
                            {room.name}
                          </h3>

                          <p className="text-muted-foreground mb-4">
                            {t.upTo} {room.capacity} {room.capacity !== 1 ? t.guestPlural : t.guest}
                          </p>

                          <div className="mb-4">
                            <p className="text-lg font-semibold text-foreground">
                              €{displayPricePerNight}{t.perNight}
                            </p>
                            <p className="text-sm text-red-500">
                              {t.unavailable}
                            </p>
                          </div>

                          <Button
                            variant="outline"
                            className="w-full"
                            disabled
                          >
                            {t.unavailable}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
