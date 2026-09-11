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

export function postSlug(id: string): string {
  return id.replace(/^(en|es)\//, '');
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
