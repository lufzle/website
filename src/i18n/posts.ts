import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from './ui';

export interface LocalizedPaths {
  en: string;
  es: string;
}

const translatedSlugPairs: Record<string, { en: string; es: string }> = {
  'nobody-wrote-the-matrix': {
    en: 'nobody-wrote-the-matrix',
    es: 'nadie-escribio-matrix',
  },
  'nadie-escribio-matrix': {
    en: 'nobody-wrote-the-matrix',
    es: 'nadie-escribio-matrix',
  },
};

const SPANISH_MONTHS: Record<string, string> = {
  ene: 'Jan',
  feb: 'Feb',
  mar: 'Mar',
  abr: 'Apr',
  may: 'May',
  jun: 'Jun',
  jul: 'Jul',
  ago: 'Aug',
  sep: 'Sep',
  set: 'Sep',
  oct: 'Oct',
  nov: 'Nov',
  dic: 'Dec',
};

export function postSlug(id: string): string {
  return id.replace(/^(en|es)\//, '');
}

export function parsePostDate(dateStr: string): Date | undefined {
  let parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) {
    const normalized = dateStr
      .toLowerCase()
      .replace(
        /\b(ene|feb|mar|abr|may|jun|jul|ago|sep|set|oct|nov|dic)[a-z]*\b/g,
        (m) => SPANISH_MONTHS[m.slice(0, 3)] ?? m,
      );
    parsed = Date.parse(normalized);
  }
  if (Number.isNaN(parsed)) return undefined;
  return new Date(parsed);
}

export function rssPath(locale: Locale): string {
  return locale === 'es' ? '/es/rss.xml' : '/rss.xml';
}

export async function postsForLocale(locale: Locale): Promise<CollectionEntry<'posts'>[]> {
  const posts = await getCollection('posts', ({ id }) => id.startsWith(`${locale}/`));
  return posts.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
}

export function localizedPostPaths(post: CollectionEntry<'posts'>): LocalizedPaths {
  const slug = postSlug(post.id);
  const translationSlugs = translatedSlugPairs[slug] ?? { en: slug, es: slug };

  return {
    en: `/write/${translationSlugs.en}/`,
    es: `/es/write/${translationSlugs.es}/`,
  };
}

export function writePostPaths(locale: Locale) {
  return async () => {
    const posts = await postsForLocale(locale);
    return posts.map((post) => ({
      params: { slug: postSlug(post.id) },
      props: { post },
    }));
  };
}
