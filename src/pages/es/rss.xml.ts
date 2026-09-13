import type { APIContext } from 'astro';
import { postsRss } from '../../i18n/rss';

export async function GET(context: APIContext) {
  return postsRss(context, 'es');
}
