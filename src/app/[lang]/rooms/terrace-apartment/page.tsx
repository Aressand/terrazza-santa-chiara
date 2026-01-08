import { getDictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/config";
import RoomDetailClient from "@/components/rooms/RoomDetailClient";

// Image paths
const images = {
  hero: "/images/terrace-apartment.jpg",
  gallery: [
    { src: "/images/terrace-apartment.jpg", key: "main" },
    { src: "/images/garden-room-interior.jpg", key: "interior" },
    { src: "/images/garden-room-bathroom.jpg", key: "bathroom" },
    { src: "/images/garden-room-view.jpg", key: "view" },
    { src: "/images/garden-room-details.jpg", key: "kitchen" },
    { src: "/images/terrace-apartment.jpg", key: "ambiance" },
  ],
};

export default async function TerraceApartmentPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return (
    <RoomDetailClient
      roomType="terrace"
      capacity={2}
      lang={lang}
      translations={{
        roomPage: dictionary.roomPage,
        room: dictionary.rooms.terrace,
        bookingWidget: dictionary.bookingWidget,
      }}
      images={images}
    />
  );
}
