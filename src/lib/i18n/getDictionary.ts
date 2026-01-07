import type { Locale } from './config';

const dictionaries = {
  it: () => import('./dictionaries/it.json').then((module) => module.default),
  en: () => import('./dictionaries/en.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]();
};
