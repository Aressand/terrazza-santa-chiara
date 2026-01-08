import { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import RoomsPreview from "@/components/home/RoomsPreview";
import CompetitiveAdvantages from "@/components/home/CompetitiveAdvantages";
import FeaturesPreview from "@/components/home/FeaturesPreview";
import CallToAction from "@/components/home/CallToAction";
import { JsonLd } from "@/components/seo/JsonLd";
import { getLodgingBusinessSchema, getFAQSchema } from "@/lib/seo/schemas";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return {
    title: dict.seo.home.title,
    description: dict.seo.home.description,
    openGraph: {
      title: dict.seo.home.title,
      description: dict.seo.home.description,
      locale: lang === "it" ? "it_IT" : "en_US",
      type: "website",
      siteName: dict.seo.siteName,
    },
    alternates: {
      canonical: `https://terrazzasantachiara.com/${lang}`,
      languages: {
        it: "/it",
        en: "/en",
      },
    },
  };
}

export default async function Home({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return (
    <>
      <JsonLd data={getLodgingBusinessSchema()} />
      <JsonLd data={getFAQSchema()} />
      <main className="min-h-screen bg-background pb-20 md:pb-0" role="main" aria-label="Terrazza Santa Chiara B&B homepage">
        <HeroSection dictionary={dictionary} />
        <RoomsPreview dictionary={dictionary} lang={lang} />
        <CompetitiveAdvantages dictionary={dictionary} />
        <FeaturesPreview dictionary={dictionary} />
        <CallToAction dictionary={dictionary} />
      </main>
    </>
  );
}
