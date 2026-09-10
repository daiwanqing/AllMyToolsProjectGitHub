import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  optimizeDeps: {
    // The repository contains an Edge profile snapshot with unrelated HTML and dynamic imports.
    entries: ['index.html'],
  },
});
