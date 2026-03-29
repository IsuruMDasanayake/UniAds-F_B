import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Expose to Docker network
    port: 5173,      // Internal container port
    hmr: {
      host: 'localhost',    // Browser connects to this host
      clientPort: 4000,     // Port accessed by the browser
      protocol: 'ws',       // Explicit protocol prevents fallback to HTTP polling
    },
    watch: {
      usePolling: true,     // Required for file sync on Windows hosts
      interval: 2000,       // Poll every 2s instead of constantly (prevents phantom-change loops)
      ignored: [            // Ignore generated files that would cause feedback loops
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
      ],
    },
  },
})

