import HeroSection from "@/components/home/HeroSection";
import RoomsPreview from "@/components/home/RoomsPreview";
import CompetitiveAdvantages from "@/components/home/CompetitiveAdvantages";
import FeaturesPreview from "@/components/home/FeaturesPreview";
import CallToAction from "@/components/home/CallToAction";
import { JsonLd } from "@/components/seo/JsonLd";
import { getLodgingBusinessSchema, getFAQSchema } from "@/lib/seo/schemas";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  // Await params to satisfy Next.js async params requirement
  await params;

  return (
    <>
      <JsonLd data={getLodgingBusinessSchema()} />
      <JsonLd data={getFAQSchema()} />
      <main className="min-h-screen bg-background pb-20 md:pb-0" role="main" aria-label="Terrazza Santa Chiara B&B homepage">
        <HeroSection />
        <RoomsPreview />
        <CompetitiveAdvantages />
        <FeaturesPreview />
        <CallToAction />
      </main>
    </>
  );
}
