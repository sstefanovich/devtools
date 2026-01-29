import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor libraries into their own chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mermaid-vendor': ['mermaid'],
          'qrcode-vendor': ['qrcode'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB for vendor chunks
  },
})

