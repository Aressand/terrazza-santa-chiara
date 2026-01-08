import { getDictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/config";
import RoomDetailClient from "@/components/rooms/RoomDetailClient";

// Image paths
const images = {
  hero: "/images/stone-vault-apartment.jpg",
  gallery: [
    { src: "/images/stone-vault-apartment.jpg", key: "main" },
    { src: "/images/stone-vault-interior.jpg", key: "interior" },
    { src: "/images/stone-vault-bathroom.jpg", key: "bathroom" },
    { src: "/images/stone-vault-kitchen.jpg", key: "kitchen" },
    { src: "/images/stone-vault-details.jpg", key: "vaults" },
    { src: "/images/stone-vault-apartment.jpg", key: "living" },
  ],
};

export default async function StoneVaultApartmentPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return (
    <RoomDetailClient
      roomType="stone"
      capacity={4}
      lang={lang}
      translations={{
        roomPage: dictionary.roomPage,
        room: dictionary.rooms.stoneVault,
        bookingWidget: dictionary.bookingWidget,
      }}
      images={images}
    />
  );
}
