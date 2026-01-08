import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import type { Dictionary } from '@/lib/i18n/types';

const gardenRoomImg = "/images/garden-room.jpg";
const terraceApartmentImg = "/images/terrace-apartment.jpg";
const modernApartmentImg = "/images/modern-apartment.jpg";
const stoneVaultImg = "/images/stone-vault.jpg";

interface RoomsPreviewProps {
  dictionary: Dictionary;
  lang: string;
}

const RoomsPreview = ({ dictionary, lang }: RoomsPreviewProps) => {
  const t = dictionary.home.rooms;

  const rooms = [
    {
      id: 1,
      slug: "garden-room",
      translationKey: "garden" as const,
      image: gardenRoomImg,
    },
    {
      id: 2,
      slug: "terrace-apartment",
      translationKey: "terrace" as const,
      image: terraceApartmentImg,
    },
    {
      id: 3,
      slug: "modern-apartment",
      translationKey: "modern" as const,
      image: modernApartmentImg,
    },
    {
      id: 4,
      slug: "stone-vault-apartment",
      translationKey: "stoneVault" as const,
      image: stoneVaultImg,
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container-bnb">
        <div className="text-center mb-12">
          <h2 className="text-display text-3xl lg:text-4xl mb-4 text-foreground">
            {t.sectionTitle}
          </h2>
          <p className="text-body text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rooms.map((room, index) => {
            const roomT = t[room.translationKey];
            return (
              <Card
                key={room.id}
                className="group overflow-hidden hover-lift animate-slide-up bg-card border-border/50 hover:border-sage/30 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={room.image}
                    alt={roomT.alt}
                    className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <CardHeader className="pb-4">
                  <CardTitle className="text-heading text-sage text-xl mb-1">
                    {roomT.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-medium">
                    {roomT.capacity}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  <CardDescription className="text-body text-foreground/80 mb-6 leading-relaxed">
                    {roomT.description}
                  </CardDescription>

                  <Button
                    variant="outline"
                    className="w-full group-hover:border-sage group-hover:text-sage transition-colors duration-300"
                    aria-label={`${t.discoverRoom}: ${roomT.title}`}
                    asChild
                  >
                    <Link href={`/${lang}/rooms/${room.slug}`}>
                      {t.discoverRoom}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RoomsPreview;
