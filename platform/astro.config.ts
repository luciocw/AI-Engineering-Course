import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import expressiveCode from 'astro-expressive-code';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  output: 'static',

  integrations: [
    expressiveCode({
      themes: ['github-dark-high-contrast'],
      styleOverrides: {
        borderRadius: '12px',
        borderColor: '#2a3040',
        codeBackground: '#1a1f2e',
        codeFontFamily: "'JetBrains Mono', monospace",
        codeFontSize: '0.875rem',
        frames: {
          frameBoxShadowCssValue: '0 4px 24px rgba(0, 0, 0, 0.4)',
        },
      },
    }),
    mdx(),
    react(),
  ],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@course': resolve('./..'),
      },
    },
  },
});
