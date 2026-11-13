// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Cambia SITE_URL cuando tengamos dominio propio (p. ej. https://fielesalbalompie.es)
const site = process.env.SITE_URL ?? 'https://web-pena-fieles.andresfernandezgomez.workers.dev';

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: (page) => !page.includes('/admin') })],
  vite: { plugins: [tailwindcss()] },
});
