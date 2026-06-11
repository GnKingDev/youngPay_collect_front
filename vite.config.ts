import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api/v1': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Seuil d'alerte chunk (dashboard est gros, c'est voulu)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Séparer les grosses dépendances en chunks distincts pour le cache navigateur
        manualChunks: {
          'vendor-react':  ['react', 'react-dom', 'react-router-dom'],
          'vendor-lucide': ['lucide-react'],
        },
      },
    },

    // Minification esbuild (inclus dans Vite, pas besoin d'installer)
    minify: 'esbuild',

    // Source maps désactivées en prod
    sourcemap: false,
  },
})
