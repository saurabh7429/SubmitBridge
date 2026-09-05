import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,  // Start dev server on port 3000 (same as CRA default)
    // Proxy: forward /api requests to the Express server running on port 5000
    // This avoids CORS issues during development — React calls /api/... and
    // Vite transparently forwards it to http://localhost:5000/api/...
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
