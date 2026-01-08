import { Button } from "@/components/ui/button";
import type { Dictionary } from '@/lib/i18n/types';

interface CallToActionProps {
  dictionary: Dictionary;
}

const CallToAction = ({ dictionary }: CallToActionProps) => {
  const t = dictionary.home.cta;

  return (
    <section className="py-16 bg-gradient-natural" aria-label="Book your stay">
      <div className="container-narrow text-center">
        <h2 className="text-display text-3xl lg:text-4xl mb-6 text-foreground">
          {t.title}
        </h2>
        <p className="text-body text-lg mb-8 text-muted-foreground">
          {t.subtitle}
        </p>
        <Button
          variant="terracotta"
          size="lg"
          className="text-lg min-h-[48px] touch-manipulation"
          aria-label="Check room availability and book your stay"
        >
          {t.button}
        </Button>
      </div>
    </section>
  );
};

export default CallToAction;
