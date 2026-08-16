import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite serves `public/` as-is at the site root, so `img/logo.png` in the
// original HTML keeps working unchanged as `/img/logo.png`.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  build: { outDir: 'dist' },
});
