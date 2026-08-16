import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API = 'http://localhost:3001';

// Vite serves `public/` as-is at the site root, so `img/logo.png` from the
// original HTML still works as `/img/logo.png`. /api and /uploads are proxied
// to the local Express + Postgres server in /server.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': { target: API, changeOrigin: true },
      '/uploads': { target: API, changeOrigin: true },
    },
  },
  build: { outDir: 'dist' },
});
