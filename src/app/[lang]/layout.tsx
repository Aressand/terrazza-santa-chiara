// src/app/[lang]/layout.tsx

import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileContactActions from "@/components/MobileContactActions";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/config";
import { i18n } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const baseUrl = "https://terrazzasantachiara.com";

  return {
    alternates: {
      canonical: `${baseUrl}/${lang}`,
      languages: Object.fromEntries(
        i18n.locales.map((locale) => [locale, `${baseUrl}/${locale}`])
      ),
    },
  };
}

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return (
    <>
      <Header translations={dictionary.nav} />
      <MobileContactActions />
      {children}
      <Footer translations={dictionary.footer} lang={lang} />
    </>
  );
}
