import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// RAMYA-COOK build configuration.
// Mobile-first PWA. Service worker + manifest live in /public and are copied verbatim.
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
  build: { outDir: 'dist', sourcemap: false },
});
