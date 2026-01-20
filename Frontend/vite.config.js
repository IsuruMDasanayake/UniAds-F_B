import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Expose to Docker network
    port: 5173,      // Internal container port
    hmr: {
      clientPort: 3000, // Port accessed by the browser
    },
    watch: {
      usePolling: true, // Required for file sync on Windows hosts
    },
  },
})
