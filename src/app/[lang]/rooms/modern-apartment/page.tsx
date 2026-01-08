import { getDictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/config";
import RoomDetailClient from "@/components/rooms/RoomDetailClient";

// Image paths
const images = {
  hero: "/images/modern-apartment.jpg",
  gallery: [
    { src: "/images/modern-apartment.jpg", key: "main" },
    { src: "/images/modern-apartment-interior.jpg", key: "interior" },
    { src: "/images/modern-apartment-bathroom.jpg", key: "bathroom" },
    { src: "/images/modern-apartment-kitchen.jpg", key: "kitchen" },
    { src: "/images/modern-apartment-bedroom.jpg", key: "bedroom" },
    { src: "/images/modern-apartment.jpg", key: "living" },
  ],
};

export default async function ModernApartmentPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return (
    <RoomDetailClient
      roomType="modern"
      capacity={4}
      lang={lang}
      translations={{
        roomPage: dictionary.roomPage,
        room: dictionary.rooms.modern,
        bookingWidget: dictionary.bookingWidget,
      }}
      images={images}
    />
  );
}
