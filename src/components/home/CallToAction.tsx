import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="py-16 bg-gradient-natural" aria-label="Book your stay">
      <div className="container-narrow text-center">
        <h2 className="text-display text-3xl lg:text-4xl mb-6 text-foreground">
          Experience Authentic Assisi
        </h2>
        <p className="text-body text-lg mb-8 text-muted-foreground">
          Discover the charm of medieval Umbria in an intimate and refined setting
        </p>
        <Button
          variant="terracotta"
          size="lg"
          className="text-lg min-h-[48px] touch-manipulation"
          aria-label="Check room availability and book your stay"
        >
          Check Availability
        </Button>
      </div>
    </section>
  );
};

export default CallToAction;
