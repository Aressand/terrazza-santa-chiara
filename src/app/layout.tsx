import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://terrazzasantachiara.com'),
  title: {
    default: 'Terrazza Santa Chiara | B&B Assisi',
    template: '%s | Terrazza Santa Chiara'
  },
  description: 'Charming B&B in Assisi, 30 meters from Basilica di Santa Chiara. 4 unique rooms with stunning views of Umbrian countryside.',
  keywords: ['B&B Assisi', 'hotel Assisi', 'accommodation Umbria', 'Santa Chiara Assisi', 'luxury B&B Italy', 'Assisi accommodation', 'Umbria hotels', 'boutique hotel Assisi'],
  authors: [{ name: 'Terrazza Santa Chiara' }],
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    alternateLocale: 'en_US',
    siteName: 'Terrazza Santa Chiara',
    title: 'Terrazza Santa Chiara | B&B Assisi',
    description: 'Charming B&B in Assisi, 30 meters from Basilica di Santa Chiara. 4 unique rooms with stunning views of Umbrian countryside.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terrazza Santa Chiara | B&B Assisi',
    description: 'Charming B&B in Assisi, 30 meters from Basilica di Santa Chiara. 4 unique rooms with stunning views of Umbrian countryside.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-inter antialiased">
        {children}
      </body>
    </html>
  );
}
