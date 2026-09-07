import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from './ui';

export function postSlug(id: string): string {
  return id.replace(/^(en|es)\//, '');
}

export async function postsForLocale(locale: Locale): Promise<CollectionEntry<'posts'>[]> {
  const posts = await getCollection('posts', ({ id }) => id.startsWith(`${locale}/`));
  return posts.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
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
