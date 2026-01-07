# PHASE 6: INTERNATIONALIZATION (i18n)

> **Goal:** Support Italian (primary) and English languages with SEO-friendly URLs
> **Priority:** MEDIUM - Improves experience for international tourists
> **Estimated Effort:** 3-4 development sessions

---

## OVERVIEW

Implement multi-language support using Next.js App Router i18n pattern:
- **Primary language:** Italian (it)
- **Secondary language:** English (en)
- **URL structure:** Subpath routing (`/it/...`, `/en/...`)
- **Default:** Italian (redirect `/` to `/it`)

---

## URL STRUCTURE

```
terrazzasantachiara.com/it              → Homepage (Italian)
terrazzasantachiara.com/en              → Homepage (English)
terrazzasantachiara.com/it/rooms/garden → Garden Room (Italian)
terrazzasantachiara.com/en/rooms/garden → Garden Room (English)
terrazzasantachiara.com/it/about        → About (Italian)
terrazzasantachiara.com/en/about        → About (English)
terrazzasantachiara.com/it/contact      → Contact (Italian)
terrazzasantachiara.com/en/contact      → Contact (English)
terrazzasantachiara.com/admin/...       → Admin (NO i18n, Italian only)
```

---

## TASKS CHECKLIST

### 6.1 i18n Configuration
- [x] Create `lib/i18n/config.ts` with locales and default locale
- [x] Create `middleware.ts` for locale detection and routing
- [x] Restructure `app/` folder with `[lang]` dynamic segment

### 6.2 Translation System
- [X] Create `lib/i18n/dictionaries/it.json` (Italian translations)
- [X] Create `lib/i18n/dictionaries/en.json` (English translations)
- [X] Create `lib/i18n/getDictionary.ts` helper function

### 6.3 Language Switcher
- [ ] Replace simple toggle button with dropdown menu
- [ ] Add to header/navigation
- [ ] Preserve current path when switching language

### 6.4 Update Pages
- [ ] Move public pages into `app/[lang]/` folder
- [ ] Update all pages to receive and use `lang` param
- [ ] Update all hardcoded Italian text to use translations


### 6.5 SEO for i18n
- [ ] Add hreflang tags to all pages
- [ ] Update sitemap.ts with all language variants
- [ ] Update metadata with proper locale

---

## IMPLEMENTATION GUIDE

### 6.1 i18n Configuration

**File: `lib/i18n/config.ts`**
```typescript
export const i18n = {
  defaultLocale: 'it',
  locales: ['it', 'en'],
} as const;

export type Locale = (typeof i18n)['locales'][number];
```

**File: `middleware.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { i18n } from '@/lib/i18n/config';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip admin routes - no i18n
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  
  // Skip api routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // Skip static files
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Check if pathname has locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (pathnameHasLocale) return NextResponse.next();
  
  // Redirect to default locale
  const locale = i18n.defaultLocale;
  return NextResponse.redirect(
    new URL(`/${locale}${pathname}`, request.url)
  );
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\..*).*)'],
};
```

### 6.2 Translation System

**File: `lib/i18n/dictionaries/it.json`**
```json
{
  "common": {
    "bookNow": "Prenota Ora",
    "learnMore": "Scopri di più",
    "backToHome": "Torna alla Home",
    "rooms": "Camere",
    "about": "Chi Siamo",
    "contact": "Contatti"
  },
  "home": {
    "hero": {
      "title": "Terrazza Santa Chiara",
      "subtitle": "Il tuo rifugio nel cuore di Assisi"
    }
  },
  "rooms": {
    "garden": {
      "name": "Garden Room Sanctuary",
      "description": "..."
    },
    "terrace": {
      "name": "Panoramic Terrace Apartment",
      "description": "..."
    },
    "stoneVault": {
      "name": "Historic Stone Vault Apartment",
      "description": "..."
    },
    "modern": {
      "name": "Contemporary Luxury Apartment",
      "description": "..."
    }
  },
  "booking": {
    "checkIn": "Check-in",
    "checkOut": "Check-out",
    "guests": "Ospiti",
    "totalPrice": "Prezzo totale",
    "perNight": "a notte",
    "nights": "notti"
  }
}
```

**File: `lib/i18n/dictionaries/en.json`**
```json
{
  "common": {
    "bookNow": "Book Now",
    "learnMore": "Learn More",
    "backToHome": "Back to Home",
    "rooms": "Rooms",
    "about": "About",
    "contact": "Contact"
  },
  "home": {
    "hero": {
      "title": "Terrazza Santa Chiara",
      "subtitle": "Your retreat in the heart of Assisi"
    }
  },
  "rooms": {
    "garden": {
      "name": "Garden Room Sanctuary",
      "description": "..."
    },
    "terrace": {
      "name": "Panoramic Terrace Apartment",
      "description": "..."
    },
    "stoneVault": {
      "name": "Historic Stone Vault Apartment",
      "description": "..."
    },
    "modern": {
      "name": "Contemporary Luxury Apartment",
      "description": "..."
    }
  },
  "booking": {
    "checkIn": "Check-in",
    "checkOut": "Check-out",
    "guests": "Guests",
    "totalPrice": "Total price",
    "perNight": "per night",
    "nights": "nights"
  }
}
```

**File: `lib/i18n/getDictionary.ts`**
```typescript
import type { Locale } from './config';

const dictionaries = {
  it: () => import('./dictionaries/it.json').then((module) => module.default),
  en: () => import('./dictionaries/en.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]();
};
```

### 6.3 Folder Structure After i18n

```
app/
├── [lang]/                    # Dynamic locale segment
│   ├── layout.tsx             # Public layout with lang param
│   ├── page.tsx               # Homepage
│   ├── about/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   └── rooms/
│       └── [slug]/
│           └── page.tsx
├── admin/                     # NO changes - stays outside [lang]
│   ├── layout.tsx
│   └── ...
├── layout.tsx                 # Root layout (minimal)
├── sitemap.ts
└── robots.ts
```

### 6.4 Language Switcher

**File: `components/LanguageSwitcher.tsx`**
```typescript
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { i18n, type Locale } from '@/lib/i18n/config';

export function LanguageSwitcher({ currentLang }: { currentLang: Locale }) {
  const pathname = usePathname();
  
  const switchLocale = (newLocale: Locale) => {
    // Remove current locale from pathname
    const segments = pathname.split('/');
    segments[1] = newLocale;
    return segments.join('/');
  };
  
  return (
    <div className="flex gap-2">
      {i18n.locales.map((locale) => (
        <Link
          key={locale}
          href={switchLocale(locale)}
          className={`px-2 py-1 rounded ${
            currentLang === locale 
              ? 'bg-primary text-white' 
              : 'hover:bg-gray-100'
          }`}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
```

### 6.5 SEO Updates

**Hreflang in layout:**
```typescript
export async function generateMetadata({ params }: { params: { lang: Locale } }): Promise<Metadata> {
  return {
    alternates: {
      canonical: `https://terrazzasantachiara.com/${params.lang}`,
      languages: {
        'it': 'https://terrazzasantachiara.com/it',
        'en': 'https://terrazzasantachiara.com/en',
      },
    },
  };
}
```

**Updated sitemap.ts:**
```typescript
import { i18n } from '@/lib/i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://terrazzasantachiara.com';
  
  const routes = ['', '/about', '/contact', '/rooms/garden', '/rooms/terrace', '/rooms/stone-vault', '/rooms/modern'];
  
  return routes.flatMap((route) =>
    i18n.locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          i18n.locales.map((l) => [l, `${baseUrl}/${l}${route}`])
        ),
      },
    }))
  );
}
```

---

## FILES TO CREATE/MODIFY

| Action | File | Purpose |
|--------|------|---------|
| CREATE | `lib/i18n/config.ts` | i18n configuration |
| CREATE | `middleware.ts` | Locale routing |
| CREATE | `lib/i18n/getDictionary.ts` | Translation loader |
| CREATE | `lib/i18n/dictionaries/it.json` | Italian translations |
| CREATE | `lib/i18n/dictionaries/en.json` | English translations |
| CREATE | `components/LanguageSwitcher.tsx` | Language toggle |
| MOVE | `app/(public)/*` → `app/[lang]/*` | Restructure for i18n |
| MODIFY | All public pages | Add lang param, use translations |
| MODIFY | `app/sitemap.ts` | Multi-language sitemap |
| MODIFY | Header component | Add LanguageSwitcher |

---

## MIGRATION STRATEGY

**Phase 6 should be done incrementally:**

1. **6.1** Setup config + middleware (no breaking changes yet)
2. **6.2** Create translation files with Italian content first
3. **6.3** Restructure folders (this is the big change)
4. **6.4** Add language switcher
5. **6.5** SEO updates
6. **Final** Add English translations (can be done later)

---

## IMPORTANT NOTES

- **Admin pages:** DO NOT add i18n - keep in Italian only
- **API routes:** DO NOT add i18n
- **Booking system:** Translations needed for UI labels only, data stays as-is
- **DO NOT** change any UI/UX design
- **Test thoroughly** after folder restructure - this is the riskiest step
- **Commit after each sub-task** to allow easy rollback

---

## TRANSLATION WORKFLOW

After implementation, you (Daniele) will:
1. Review `it.json` - verify Italian content is correct
2. Translate to English in `en.json`
3. Test both language versions
4. Add any missing translations as needed
