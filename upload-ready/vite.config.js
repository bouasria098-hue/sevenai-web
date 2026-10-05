import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        terms: resolve(root, 'terms.html'),
        privacy: resolve(root, 'privacy.html'),
        cookies: resolve(root, 'cookies.html'),
        howItWorks: resolve(root, 'how-it-works.html'),
        ugcVsAi: resolve(root, 'ugc-vs-ai-ugc.html'),
        sprint: resolve(root, 'creative-testing-sprint.html'),
        about: resolve(root, 'about.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
