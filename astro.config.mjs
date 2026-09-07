// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },
  server: {
    // Let Cloudflare quick tunnels reach the Vite/Astro host check.
    allowedHosts: ['.trycloudflare.com'],
  },
});
