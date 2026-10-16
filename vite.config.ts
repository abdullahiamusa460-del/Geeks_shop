import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward API calls to the GeeksShop backend during development, so the
    // browser only ever talks to the dev-server origin (no CORS setup needed).
    // For a build/preview, set VITE_API_URL to the API origin instead.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
