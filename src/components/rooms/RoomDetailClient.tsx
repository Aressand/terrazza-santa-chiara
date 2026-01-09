"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { parseISO } from "date-fns";
import BookingWidget from "@/components/booking/BookingWidget";
import MobileOptimizedImage from "@/components/MobileOptimizedImage";
import type { RoomType } from "@/utils/roomMapping";
import type { Dictionary, RoomTranslations } from "@/lib/i18n/types";

interface RoomDetailClientProps {
  roomType: RoomType;
  capacity: number;
  lang: string;
  translations: {
    roomPage: Dictionary["roomPage"];
    room: RoomTranslations;
    bookingWidget: Dictionary["bookingWidget"];
    bookingCalendar: Dictionary["bookingCalendar"];
    bookingForm: Dictionary["bookingForm"];
  };
  images: {
    hero: string;
    gallery: { src: string; key: string }[];
  };
}

export default function RoomDetailClient({
  roomType,
  capacity,
  lang,
  translations,
  images,
}: RoomDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const searchParams = useSearchParams();
  const { roomPage: t, room } = translations;

  // Get URL parameters
  const checkInParam = searchParams.get("checkIn");
  const checkOutParam = searchParams.get("checkOut");
  const guestsParam = searchParams.get("guests");

  // Parse dates if they exist
  const presetCheckIn = checkInParam ? parseISO(checkInParam) : undefined;
  const presetCheckOut = checkOutParam ? parseISO(checkOutParam) : undefined;
  const presetGuests = guestsParam ? parseInt(guestsParam) : undefined;

  // Build gallery with translated alt texts
  const galleryImages = images.gallery.map((img) => ({
    src: img.src,
    alt: room.gallery[img.key] || img.key,
  }));

  // Get details as array for rendering
  const detailsEntries = Object.entries(room.details);

  // Map detail keys to translated labels
  const detailLabels: Record<string, string> = {
    size: t.size,
    bed: t.bed,
    beds: t.beds,
    bathroom: t.bathroom,
    kitchen: t.kitchen,
    garden: t.garden,
    terrace: t.terrace,
    view: t.view,
    architecture: t.architecture,
    capacity: t.capacity,
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Image */}
      <section className="relative h-[60vh] overflow-hidden">
        <MobileOptimizedImage
          src={images.hero}
          alt={room.heroAlt}
          className="w-full h-full object-cover"
          priority={true}
        />
        <div className="absolute inset-0 bg-stone/40" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-playfair mb-4">
            {room.heroTitle}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl">{room.heroSubtitle}</p>
        </div>

        {/* Back Navigation */}
        <Link
          href={`/${lang}`}
          className="absolute top-4 left-4 md:top-8 md:left-8 bg-white/20 backdrop-blur-sm rounded-full p-2 md:p-3 text-white hover:bg-white/30 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={t.backToHome}
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </Link>
      </section>

      {/* Image Gallery */}
      <section className="py-12 lg:py-16">
        <div className="container-bnb">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Image */}
            <div className="lg:col-span-8">
              <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-soft">
                <MobileOptimizedImage
                  src={galleryImages[selectedImage].src}
                  alt={galleryImages[selectedImage].alt}
                  className="w-full h-full object-cover hover-scale cursor-pointer"
                />
              </div>
            </div>

            {/* Thumbnail Grid */}
            <div className="lg:col-span-4">
              <div className="grid grid-cols-2 gap-4">
                {galleryImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden shadow-soft transition-all min-w-[44px] min-h-[44px] ${
                      selectedImage === index
                        ? "ring-2 ring-sage"
                        : "hover:opacity-80"
                    }`}
                    aria-label={image.alt}
                  >
                    <MobileOptimizedImage
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Room Description */}
      <section className="py-12 lg:py-16">
        <div className="container-bnb">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-playfair text-sage mb-4">
                    {room.title}
                  </h2>
                  <p className="text-xl text-sage/80 mb-6">{room.subtitle}</p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {room.description}
                  </p>
                  {room.descriptionExtra && (
                    <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                      {room.descriptionExtra}
                    </p>
                  )}
                </div>

                {/* Room Details */}
                <div>
                  <h3 className="text-2xl font-playfair text-sage mb-4">
                    {t.roomDetails}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                    {detailsEntries.map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between border-b border-border pb-2"
                      >
                        <span>{detailLabels[key] || key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-2xl font-playfair text-sage mb-6">
                    {t.whatMakesSpecial}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {room.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Widget */}
            <div className="lg:col-span-1">
              <BookingWidget
                roomType={roomType}
                roomName={room.heroTitle}
                capacity={capacity}
                presetCheckIn={presetCheckIn}
                presetCheckOut={presetCheckOut}
                presetGuests={presetGuests}
                translations={translations.bookingWidget}
                calendarTranslations={translations.bookingCalendar}
                formTranslations={translations.bookingForm}
                lang={lang}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
