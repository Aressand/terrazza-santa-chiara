import { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/config";
import ContactClient from "@/components/contact/ContactClient";

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return {
    title: dict.seo.contact.title,
    description: dict.seo.contact.description,
    openGraph: {
      title: dict.seo.contact.title,
      description: dict.seo.contact.description,
      locale: lang === "it" ? "it_IT" : "en_US",
      type: "website",
      siteName: dict.seo.siteName,
    },
    alternates: {
      canonical: `https://terrazzasantachiara.com/${lang}/contact`,
      languages: {
        it: "/it/contact",
        en: "/en/contact",
      },
    },
  };
}

export default async function ContactPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return <ContactClient translations={dictionary.contact} />;
}
