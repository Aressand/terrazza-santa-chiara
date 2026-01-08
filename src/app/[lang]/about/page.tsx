import { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/config";
import AboutClient from "@/components/about/AboutClient";

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return {
    title: dict.seo.about.title,
    description: dict.seo.about.description,
    openGraph: {
      title: dict.seo.about.title,
      description: dict.seo.about.description,
      locale: lang === "it" ? "it_IT" : "en_US",
      type: "website",
      siteName: dict.seo.siteName,
    },
    alternates: {
      canonical: `https://terrazzasantachiara.com/${lang}/about`,
      languages: {
        it: "/it/about",
        en: "/en/about",
      },
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return <AboutClient translations={dictionary.about} />;
}
