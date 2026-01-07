import type { Locale } from './config';

export type PageParams = {
  params: Promise<{ lang: Locale }>;
};

export type RoomPageParams = {
  params: Promise<{ lang: Locale; slug: string }>;
};
