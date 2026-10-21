import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Se publica junto a Storybook: /trama-design-system/lab/temas/
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  plugins: [react()],
  resolve: { alias: { '@trama': fileURLToPath(new URL('../../src/index.ts', import.meta.url)) } },
  build: { outDir: '../../storybook-static/lab/temas', emptyOutDir: true },
});
