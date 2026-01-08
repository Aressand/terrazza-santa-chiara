"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, Shield, Heart, MapPin, Users } from "lucide-react";
import MobileOptimizedImage from "@/components/MobileOptimizedImage";
import type { Dictionary } from "@/lib/i18n/types";

// Image paths
const assisiHeroBg = "/images/assisi-hero-bg.jpg";

interface AboutClientProps {
  translations: Dictionary["about"];
}

const AboutClient = ({ translations: t }: AboutClientProps) => {
  const policies = [
    {
      icon: Clock,
      title: t.policies.checkInTimes.title,
      details: t.policies.checkInTimes.details,
    },
    {
      icon: Shield,
      title: t.policies.cancellation.title,
      details: t.policies.cancellation.details,
    },
    {
      icon: Heart,
      title: t.policies.petPolicy.title,
      details: t.policies.petPolicy.details,
    },
    {
      icon: Users,
      title: t.policies.languages.title,
      details: t.policies.languages.details,
    },
  ];

  return (
    <main className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <MobileOptimizedImage
          src={assisiHeroBg}
          alt={t.heroAlt}
          className="w-full h-full object-cover"
          priority={true}
        />
        <div className="absolute inset-0 bg-stone/50" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          <h1 className="text-4xl lg:text-6xl font-playfair mb-6">
            {t.heroTitle}
          </h1>
          <p className="text-xl lg:text-2xl max-w-3xl">{t.heroSubtitle}</p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 lg:py-24">
        <div className="container-bnb">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-playfair text-sage mb-6">
                {t.story.title}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {t.story.paragraph1}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t.story.paragraph2}
              </p>
            </div>

            <div className="space-y-4">
              <Card className="bg-sage-light/20 border-sage/30">
                <CardContent className="p-6 text-center">
                  <MapPin className="w-8 h-8 text-sage mx-auto mb-3" />
                  <h3 className="font-semibold text-lg text-sage mb-2">
                    {t.highlights.location.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {t.highlights.location.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-terracotta-light/20 border-terracotta/30">
                <CardContent className="p-6 text-center">
                  <Heart className="w-8 h-8 text-terracotta mx-auto mb-3" />
                  <h3 className="font-semibold text-lg text-terracotta mb-2">
                    {t.highlights.experience.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {t.highlights.experience.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Policies & Services */}
      <section className="py-16 lg:py-24 bg-stone-light/30">
        <div className="container-bnb">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-playfair text-sage mb-4">
              {t.policies.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.policies.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {policies.map((policy, index) => (
              <Card key={index} className="text-center hover-lift">
                <CardContent className="p-6">
                  <policy.icon className="w-8 h-8 text-sage mx-auto mb-4" />
                  <h3 className="font-semibold text-lg text-sage mb-2">
                    {policy.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {policy.details}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Services List */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-playfair text-sage text-center mb-8">
              {t.services.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {t.services.items.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-soft"
                >
                  <div className="w-2 h-2 bg-sage rounded-full shrink-0" />
                  <span className="text-muted-foreground">{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Important Times */}
          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto bg-white border-sage/20">
              <CardContent className="p-8">
                <Clock className="w-12 h-12 text-sage mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-sage mb-4">
                  {t.checkInOut.title}
                </h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    <strong>{t.checkInOut.checkIn}:</strong>{" "}
                    {t.checkInOut.checkInTime}
                  </p>
                  <p>
                    <strong>{t.checkInOut.checkOut}:</strong>{" "}
                    {t.checkInOut.checkOutTime}
                  </p>
                  <p className="text-sm mt-4 pt-4 border-t border-border">
                    {t.checkInOut.lateArrival}
                    <br />
                    {t.checkInOut.lateCheckout}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutClient;
