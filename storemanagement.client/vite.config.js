import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    proxy: {
      '^/api': {
        target: 'https://localhost:7064',
        // target: 'http://localhost:5069/',
        secure: false
      }
    }
  }
})
