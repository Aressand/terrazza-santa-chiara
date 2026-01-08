import { Metadata } from "next";
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

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return {
    title: dict.seo.rooms.modern.title,
    description: dict.seo.rooms.modern.description,
    openGraph: {
      title: dict.seo.rooms.modern.title,
      description: dict.seo.rooms.modern.description,
      locale: lang === "it" ? "it_IT" : "en_US",
      type: "website",
      siteName: dict.seo.siteName,
    },
    alternates: {
      canonical: `https://terrazzasantachiara.com/${lang}/rooms/modern-apartment`,
      languages: {
        it: "/it/rooms/modern-apartment",
        en: "/en/rooms/modern-apartment",
      },
    },
  };
}

export default async function ModernApartmentPage({ params }: Props) {
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
