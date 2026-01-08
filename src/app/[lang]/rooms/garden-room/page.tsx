import { getDictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/config";
import RoomDetailClient from "@/components/rooms/RoomDetailClient";

// Image paths
const images = {
  hero: "/images/garden-room.jpg",
  gallery: [
    { src: "/images/garden-room.jpg", key: "main" },
    { src: "/images/garden-room-interior.jpg", key: "interior" },
    { src: "/images/garden-room-bathroom.jpg", key: "bathroom" },
    { src: "/images/garden-room-view.jpg", key: "view" },
    { src: "/images/garden-room-details.jpg", key: "details" },
    { src: "/images/garden-room.jpg", key: "ambiance" },
  ],
};

export default async function GardenRoomPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return (
    <RoomDetailClient
      roomType="garden"
      capacity={2}
      lang={lang}
      translations={{
        roomPage: dictionary.roomPage,
        room: dictionary.rooms.garden,
        bookingWidget: dictionary.bookingWidget,
      }}
      images={images}
    />
  );
}
