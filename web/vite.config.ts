import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During `npm run dev` API calls are proxied to a backend started with `npm run dev` in ../server.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': process.env.API_TARGET || 'http://127.0.0.1:9000' } },
  build: { outDir: 'dist', emptyOutDir: true, sourcemap: false },
});
