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
const stoneVaultHero = "/images/stone-vault-apartment.jpg";
const stoneVaultInterior = "/images/stone-vault-interior.jpg";
const stoneVaultBathroom = "/images/stone-vault-bathroom.jpg";
const stoneVaultKitchen = "/images/stone-vault-kitchen.jpg";
const stoneVaultVaults = "/images/stone-vault-details.jpg";

export default function StoneVaultApartment() {
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
    { src: stoneVaultHero, alt: "Historic stone vault apartment" },
    { src: stoneVaultInterior, alt: "13th century vaulted ceilings" },
    { src: stoneVaultBathroom, alt: "Modern bathroom in historic setting" },
    { src: stoneVaultKitchen, alt: "Equipped kitchen" },
    { src: stoneVaultVaults, alt: "Authentic medieval architecture" },
    { src: stoneVaultHero, alt: "Stone vault living space" }
  ];

  const amenities = [
    "Authentic 13th century stone vaulted ceilings",
    "Cool summers guaranteed (natural stone insulation)",
    "Full kitchen with modern appliances",
    "King bed + queen sofa bed (sleeps 4)",
    "Lightning-fast WiFi in historic setting",
    "Unique medieval architectural features"
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Image */}
      <section className="relative h-[60vh] overflow-hidden">
        <MobileOptimizedImage
          src={stoneVaultHero}
          alt="Historic Stone Vault Apartment with 13th century architecture"
          className="w-full h-full object-cover"
          priority={true}
        />
        <div className="absolute inset-0 bg-stone/40" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-playfair mb-4">Historic Stone Vault Apartment</h1>
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
                    Your Medieval Living Experience
                  </h2>
                  <p className="text-xl text-sage/80 mb-6">
                    Perfect for history lovers and families seeking authentic character
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Step back in time within the authentic 13th century stone vaulted ceilings of this remarkable apartment. The historic architecture creates a unique atmosphere - cool in summer thanks to natural stone insulation, warm with character year-round. Modern comforts including a full kitchen, king bed, and queen sofa bed blend seamlessly with medieval charm. Experience Assisi as it was meant to be lived, surrounded by centuries of history while enjoying contemporary amenities.
                  </p>
                </div>

                {/* Room Details */}
                <div>
                  <h3 className="text-2xl font-playfair text-sage mb-4">Room Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                    <div className="flex justify-between border-b border-border pb-2">
                      <span>Architecture:</span>
                      <span className="font-medium">13th century stone vaults</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-2">
                      <span>Beds:</span>
                      <span className="font-medium">King bed + queen sofa bed</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-2">
                      <span>Bathroom:</span>
                      <span className="font-medium">Modern amenities</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-2">
                      <span>Kitchen:</span>
                      <span className="font-medium">Full equipped kitchen</span>
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
                roomType="stone"
                roomName="Historic Stone Vault Apartment"
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
