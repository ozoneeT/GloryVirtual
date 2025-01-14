import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-pdf', 'pdfjs-dist']
  },
  build: {
    commonjsOptions: {
      include: [/react-pdf/, /pdfjs-dist/]
    },
    chunkSizeWarningLimit: 1600
  },
  base: '/'
})
