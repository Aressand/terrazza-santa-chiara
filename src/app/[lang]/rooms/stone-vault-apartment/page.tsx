import { Metadata } from "next";
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

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return {
    title: dict.seo.rooms.stoneVault.title,
    description: dict.seo.rooms.stoneVault.description,
    openGraph: {
      title: dict.seo.rooms.stoneVault.title,
      description: dict.seo.rooms.stoneVault.description,
      locale: lang === "it" ? "it_IT" : "en_US",
      type: "website",
      siteName: dict.seo.siteName,
    },
    alternates: {
      canonical: `https://terrazzasantachiara.com/${lang}/rooms/stone-vault-apartment`,
      languages: {
        it: "/it/rooms/stone-vault-apartment",
        en: "/en/rooms/stone-vault-apartment",
      },
    },
  };
}

export default async function StoneVaultApartmentPage({ params }: Props) {
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
