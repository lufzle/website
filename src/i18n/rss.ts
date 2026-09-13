import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { localizedPostPaths, parsePostDate, postsForLocale } from './posts';
import { useUi, type Locale } from './ui';

export async function postsRss(context: APIContext, locale: Locale) {
  const copy = useUi(locale);
  const posts = await postsForLocale(locale);

  const items = posts
    .map((post) => {
      const pubDate = parsePostDate(post.data.date);
      if (!pubDate) {
        throw new Error(`Post ${post.id} has an unparseable date: ${post.data.date}`);
      }

      return {
        title: post.data.title,
        description: post.data.summary,
        pubDate,
        link: localizedPostPaths(post)[locale],
      };
    })
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  const site = context.site ?? new URL('https://lufzle.dev');

  return rss({
    title: copy.write.title,
    description: copy.write.description,
    site: locale === 'es' ? new URL('/es/', site) : site,
    items,
    customData: `<language>${locale === 'es' ? 'es' : 'en-us'}</language>`,
  });
}
