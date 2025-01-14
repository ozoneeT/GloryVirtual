import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'cookie': 'cookie/index.js'
    }
  },
  optimizeDeps: {
    include: ['react-pdf', 'pdfjs-dist', 'cookie']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          pdf: ['react-pdf', 'pdfjs-dist']
        }
      }
    }
  },
  base: '/'
})
