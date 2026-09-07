import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Native filesystem events can be missed on Windows (and in synced folders).
      // Polling makes Vite reliably detect saved source changes.
      usePolling: true,
      interval: 300,
    },
  },
})
