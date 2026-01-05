"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { parseISO, differenceInDays } from "date-fns";
import BookingWidget from "@/components/booking/BookingWidget";
import MobileOptimizedImage from "@/components/MobileOptimizedImage";

// Image paths
const modernHero = "/images/modern-apartment.jpg";
const modernInterior = "/images/modern-apartment-interior.jpg";
const modernBathroom = "/images/modern-apartment-bathroom.jpg";
const modernKitchen = "/images/modern-apartment-kitchen.jpg";
const modernBedroom = "/images/modern-apartment-bedroom.jpg";

export default function ModernApartment() {
  const [selectedImage, setSelectedImage] = useState(0);
  const searchParams = useSearchParams();

  // Get URL parameters
  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');
  const guestsParam = searchParams.get('guests');

  // Parse dates if they exist
  const presetCheckIn = checkInParam ? parseISO(checkInParam) : undefined;
  const presetCheckOut = checkOutParam ? parseISO(checkOutParam) : undefined;
  const presetGuests = guestsParam ? parseInt(guestsParam) : undefined;

  // Calculate nights and total price if dates are preset
  const nights = presetCheckIn && presetCheckOut ? differenceInDays(presetCheckOut, presetCheckIn) : 0;
  const totalPrice = nights > 0 ? 95 * nights + 25 : 0; // €95/night + €25 cleaning fee

  const galleryImages = [
    { src: modernHero, alt: "Contemporary luxury apartment" },
    { src: modernInterior, alt: "Modern living space" },
    { src: modernBathroom, alt: "Spacious bathroom with emotional lighting" },
    { src: modernKitchen, alt: "Modern kitchen area" },
    { src: modernBedroom, alt: "Contemporary bedroom" },
    { src: modernHero, alt: "Modern apartment interior" }
  ];

  const amenities = [
    "Recently renovated with contemporary design",
    "Spacious bathroom with emotional lighting",
    "Full modern kitchen with all appliances",
    "King bed + queen sofa bed (sleeps 4)",
    "Lightning-fast WiFi for remote work",
    "Contemporary furnishing & smart features"
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Image */}
      <section className="relative h-[60vh] overflow-hidden">
        <MobileOptimizedImage
          src={modernHero}
          alt="Contemporary Luxury Apartment with modern design and emotional lighting"
          className="w-full h-full object-cover"
          priority={true}
        />
        <div className="absolute inset-0 bg-stone/40" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-playfair mb-4">Contemporary Luxury Apartment</h1>
          <p className="text-lg md:text-xl lg:text-2xl">Perfect for up to 4 guests</p>
        </div>

        {/* Back Navigation */}
        <Link
          href="/"
          className="absolute top-4 left-4 md:top-8 md:left-8 bg-white/20 backdrop-blur-sm rounded-full p-2 md:p-3 text-white hover:bg-white/30 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Back to homepage"
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
                    className={`aspect-square rounded-lg overflow-hidden shadow-soft transition-all min-w-[44px] min-h-[44px] ${selectedImage === index ? 'ring-2 ring-sage' : 'hover:opacity-80'
                      }`}
                    aria-label={`View ${image.alt}`}
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
                    Your Contemporary Urban Retreat
                  </h2>
                  <p className="text-xl text-sage/80 mb-6">
                    Perfect for families and groups seeking modern comfort
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Experience the perfect blend of historic Assisi charm and contemporary luxury. Our recently renovated apartment features emotional lighting, a king-size bed plus queen sofa bed, and a full modern kitchen. The spacious bathroom with sophisticated lighting creates an ambiance of pure relaxation. Ideal for remote workers and families, this contemporary space offers all modern comforts while immersing you in Assisi's timeless atmosphere.
                  </p>
                </div>

                {/* Room Details */}
                <div>
                  <h3 className="text-2xl font-playfair text-sage mb-4">Room Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                    <div className="flex justify-between border-b border-border pb-2">
                      <span>Size:</span>
                      <span className="font-medium">Full luxury apartment</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-2">
                      <span>Beds:</span>
                      <span className="font-medium">King bed + queen sofa bed</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-2">
                      <span>Bathroom:</span>
                      <span className="font-medium">Spacious with emotional lighting</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-2">
                      <span>Kitchen:</span>
                      <span className="font-medium">Full modern kitchen</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-2">
                      <span>Capacity:</span>
                      <span className="font-medium">Up to 4 guests</span>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-2xl font-playfair text-sage mb-6">What Makes This Special</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {amenities.map((amenity, index) => (
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
                roomType="modern"
                roomName="Contemporary Luxury Apartment"
                capacity={4}
                presetCheckIn={presetCheckIn}
                presetCheckOut={presetCheckOut}
                presetGuests={presetGuests}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
