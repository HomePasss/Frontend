import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// CHANGE: Enabled Vitest with jsdom to validate formatting helpers and data invariants.
// WHY: Test harness is part of the delivery criteria for the React port.
// QUOTE(TЗ): "Можешь переписать код с KMP на TypeScript React Vite"
// REF: user-message-3
// SOURCE: context.txt §AGENTS instructions
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/house-api': {
        target: 'http://jumbo.galagen.net:2205',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/house-api/, ''),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
