import { Metadata } from "next";
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

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return {
    title: dict.seo.rooms.terrace.title,
    description: dict.seo.rooms.terrace.description,
    openGraph: {
      title: dict.seo.rooms.terrace.title,
      description: dict.seo.rooms.terrace.description,
      locale: lang === "it" ? "it_IT" : "en_US",
      type: "website",
      siteName: dict.seo.siteName,
    },
    alternates: {
      canonical: `https://terrazzasantachiara.com/${lang}/rooms/terrace-apartment`,
      languages: {
        it: "/it/rooms/terrace-apartment",
        en: "/en/rooms/terrace-apartment",
      },
    },
  };
}

export default async function TerraceApartmentPage({ params }: Props) {
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
