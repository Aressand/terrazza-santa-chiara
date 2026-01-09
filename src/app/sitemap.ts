import { MetadataRoute } from 'next';
import { i18n } from '@/lib/i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://terrazzasantachiara.com';

  const routes = [
    '',
    '/about',
    '/contact',
    '/rooms/garden',
    '/rooms/terrace',
    '/rooms/stone-vault',
    '/rooms/modern'
  ];

  const priorities: Record<string, number> = {
    '': 1.0,
    '/about': 0.8,
    '/contact': 0.8,
    '/rooms/garden': 0.9,
    '/rooms/terrace': 0.9,
    '/rooms/stone-vault': 0.9,
    '/rooms/modern': 0.9,
  };

  return routes.flatMap((route) =>
    i18n.locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: priorities[route] || 0.8,
      alternates: {
        languages: Object.fromEntries(
          i18n.locales.map((l) => [l, `${baseUrl}/${l}${route}`])
        ),
      },
    }))
  );
}
