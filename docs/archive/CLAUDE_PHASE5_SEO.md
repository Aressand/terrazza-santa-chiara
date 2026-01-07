# PHASE 5: AI & SEO OPTIMIZATION

> **Goal:** Maximize organic visibility and AI search compatibility
> **Priority:** HIGH - Direct impact on booking conversions
> **Estimated Effort:** 2-3 development sessions

---

## OVERVIEW

This phase optimizes Terrazza Santa Chiara for:
1. Traditional search engines (Google, Bing)
2. AI assistants (ChatGPT, Claude, Perplexity)
3. Voice search (Siri, Google Assistant)
4. Local search (Google Maps, Apple Maps)

---

## TASKS CHECKLIST

### 5.1 Next.js Metadata API
- [ ] Implement `generateMetadata()` for dynamic pages
- [ ] Add Open Graph tags for social sharing
- [ ] Add Twitter Card metadata
- [ ] Create `robots.txt`
- [ ] Generate `sitemap.xml`

### 5.2 Structured Data (JSON-LD)
- [ ] LodgingBusiness schema for homepage
- [ ] Hotel schema with rooms as offers
- [ ] LocalBusiness schema with NAP
- [ ] BreadcrumbList for navigation
- [ ] FAQPage schema for common questions

### 5.3 Technical SEO
- [ ] Canonical URLs
- [ ] Hreflang tags (prep for i18n)
- [ ] Image optimization (next/image, WebP, alt text)
- [ ] Core Web Vitals optimization
- [ ] Mobile-first indexing compliance

### 5.4 Content Optimization
- [ ] Semantic HTML structure (h1-h6 hierarchy)
- [ ] Internal linking strategy
- [ ] Location-based keywords (Assisi, Umbria, Santa Chiara)
- [ ] Natural language content for AI parsing

---

## IMPLEMENTATION GUIDE

### 5.1 Metadata Implementation

**File: `app/layout.tsx`**
```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://terrazzasantachiara.com'),
  title: {
    default: 'Terrazza Santa Chiara | B&B Assisi',
    template: '%s | Terrazza Santa Chiara'
  },
  description: 'Charming B&B in Assisi, 30 meters from Basilica di Santa Chiara. 4 unique rooms with stunning views of Umbrian countryside.',
  keywords: ['B&B Assisi', 'hotel Assisi', 'accommodation Umbria', 'Santa Chiara Assisi'],
  authors: [{ name: 'Terrazza Santa Chiara' }],
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    alternateLocale: 'en_US',
    siteName: 'Terrazza Santa Chiara',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

**File: `app/rooms/[slug]/page.tsx`**
```typescript
import type { Metadata } from 'next';

// Dynamic metadata per room
export async function generateMetadata({ params }): Promise<Metadata> {
  const room = await getRoomData(params.slug);
  
  return {
    title: room.name,
    description: room.description,
    openGraph: {
      title: `${room.name} | Terrazza Santa Chiara`,
      description: room.description,
      images: [{ url: room.image, width: 1200, height: 630 }],
    },
  };
}
```

### 5.2 Structured Data (JSON-LD)

**File: `components/seo/JsonLd.tsx`**
```typescript
'use client';

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

**File: `lib/seo/schemas.ts`**
```typescript
export function getLodgingBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Terrazza Santa Chiara',
    description: 'Charming B&B in the heart of Assisi',
    url: 'https://terrazzasantachiara.com',
    telephone: '+39 XXX XXX XXXX',
    email: 'info@terrazzasantachiara.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Via Santa Chiara',
      addressLocality: 'Assisi',
      addressRegion: 'Umbria',
      postalCode: '06081',
      addressCountry: 'IT'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 43.0707,
      longitude: 12.6156
    },
    image: 'https://terrazzasantachiara.com/images/exterior.jpg',
    priceRange: '€70 - €90',
    starRating: {
      '@type': 'Rating',
      ratingValue: '4'
    },
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Free WiFi' },
      { '@type': 'LocationFeatureSpecification', name: 'Air Conditioning' },
      { '@type': 'LocationFeatureSpecification', name: 'Terrace' }
    ],
    hasMap: 'https://maps.google.com/?q=Terrazza+Santa+Chiara+Assisi'
  };
}

export function getRoomSchema(room: Room) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HotelRoom',
    name: room.name,
    description: room.description,
    image: room.images,
    bed: {
      '@type': 'BedDetails',
      typeOfBed: room.bedType,
      numberOfBeds: room.beds
    },
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: room.maxGuests
    },
    offers: {
      '@type': 'Offer',
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: room.basePrice,
        priceCurrency: 'EUR',
        unitText: 'per night'
      }
    },
    amenityFeature: room.amenities.map(a => ({
      '@type': 'LocationFeatureSpecification',
      name: a
    }))
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}
```

### 5.3 Sitemap & Robots

**File: `app/sitemap.ts`**
```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://terrazzasantachiara.com';
  
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.8 },
  ];
  
  const roomPages = [
    'garden', 'stone-vault', 'modern', 'terrace'
  ].map(slug => ({
    url: `${baseUrl}/rooms/${slug}`,
    lastModified: new Date(),
    priority: 0.9,
  }));
  
  return [...staticPages, ...roomPages];
}
```

**File: `app/robots.ts`**
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: 'https://terrazzasantachiara.com/sitemap.xml',
  };
}
```

### 5.4 Image Optimization

```typescript
// ALWAYS use next/image with proper attributes
import Image from 'next/image';

<Image
  src="/rooms/garden.jpg"
  alt="Garden Room with view of Umbrian countryside - Terrazza Santa Chiara Assisi"
  width={1200}
  height={800}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL={blurHash}
/>
```

---

## AI SEARCH OPTIMIZATION

### Natural Language Content
AI assistants extract answers from natural prose. Structure content to answer common questions:

```markdown
## Where is Terrazza Santa Chiara located?
Terrazza Santa Chiara is a charming bed and breakfast located in the 
historic center of Assisi, Italy, just 30 meters from the famous 
Basilica di Santa Chiara. The property offers stunning views of the 
Umbrian countryside and the valley below.

## How much does a room cost?
Room prices at Terrazza Santa Chiara start from €70 to €90 per night,
depending on the room type and season. The Garden Room and Panoramic 
Terrace Apartment start from €70, while the Historic Stone Vault and 
Contemporary Luxury Apartment start from €90 per night.
```

### FAQ Schema
```typescript
export function getFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How far is Terrazza Santa Chiara from the Basilica?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Terrazza Santa Chiara is located just 30 meters from the Basilica di Santa Chiara in Assisi.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is the check-in and check-out time?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Check-in is from 3:00 PM and check-out is by 11:00 AM. Early check-in or late check-out may be available upon request.'
        }
      }
    ]
  };
}
```

---

## TESTING & VALIDATION

### Tools
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema Validator:** https://validator.schema.org/
- **Lighthouse:** Chrome DevTools > Lighthouse
- **PageSpeed Insights:** https://pagespeed.web.dev/

### Checklist Before Deploy
- [ ] All pages have unique title and description
- [ ] JSON-LD validates without errors
- [ ] Images have descriptive alt text
- [ ] Lighthouse SEO score > 90
- [ ] Core Web Vitals pass
- [ ] Mobile-friendly test passes
- [ ] Sitemap accessible at /sitemap.xml
- [ ] Robots.txt blocks /admin/

---

## FILES TO CREATE/MODIFY

| Action | File | Purpose |
|--------|------|---------|
| MODIFY | `app/layout.tsx` | Root metadata |
| MODIFY | `app/rooms/[slug]/page.tsx` | Dynamic room metadata |
| CREATE | `app/sitemap.ts` | XML sitemap |
| CREATE | `app/robots.ts` | Robots directives |
| CREATE | `components/seo/JsonLd.tsx` | JSON-LD component |
| CREATE | `lib/seo/schemas.ts` | Schema generators |
| MODIFY | Room pages | Add structured data |
| MODIFY | Homepage | Add LodgingBusiness schema |

---

## SUCCESS METRICS

After implementation, monitor:
- Google Search Console impressions/clicks
- Rich results appearance
- Core Web Vitals scores
- Lighthouse SEO score (target: 95+)
- AI assistant citation of property info

---

## NOTES

- **DO NOT** change existing UI/UX
- **DO NOT** add features not in this spec
- **KEEP** changes minimal and focused
- **TEST** each change before proceeding
- **COMMIT** after each completed task