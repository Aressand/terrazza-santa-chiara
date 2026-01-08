import type { Dictionary } from '@/lib/i18n/types';

interface FeaturesPreviewProps {
  dictionary: Dictionary;
}

const FeaturesPreview = ({ dictionary }: FeaturesPreviewProps) => {
  const t = dictionary.home.features;

  return (
    <section className="py-16 lg:py-24" aria-label="Property features">
      <div className="container-bnb">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card-feature text-center hover-lift animate-slide-up touch-manipulation">
            <div className="w-16 h-16 bg-terracotta rounded-full flex items-center justify-center mx-auto mb-4" role="img" aria-label="Panoramic view icon">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-heading text-xl mb-3">{t.panoramic.title}</h3>
            <p className="text-body text-muted-foreground">
              {t.panoramic.description}
            </p>
          </div>

          <div className="card-feature text-center hover-lift animate-slide-up touch-manipulation" style={{animationDelay: '0.1s'}}>
            <div className="w-16 h-16 bg-sage rounded-full flex items-center justify-center mx-auto mb-4" role="img" aria-label="Authentic comfort icon">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-heading text-xl mb-3">{t.comfort.title}</h3>
            <p className="text-body text-muted-foreground">
              {t.comfort.description}
            </p>
          </div>

          <div className="card-feature text-center hover-lift animate-slide-up touch-manipulation" style={{animationDelay: '0.2s'}}>
            <div className="w-16 h-16 bg-stone rounded-full flex items-center justify-center mx-auto mb-4" role="img" aria-label="Central location icon">
              <svg className="w-8 h-8 text-stone-dark" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-heading text-xl mb-3">{t.location.title}</h3>
            <p className="text-body text-muted-foreground">
              {t.location.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesPreview;
