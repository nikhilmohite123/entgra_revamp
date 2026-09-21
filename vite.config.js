import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/db': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
      '/global': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
      '/upload': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
      '/login': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
      '/cni_lp_menu': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
      '/cni_lp_api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      }
    }
  }
})
