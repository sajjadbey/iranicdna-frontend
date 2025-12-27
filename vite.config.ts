import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import compression from 'vite-plugin-compression';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), compression({algorithm: 'gzip'})],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-is'],
          
          // Router
          'react-router': ['react-router', 'react-router-dom'],
          
          // Charting libraries
          'charts': ['chart.js', 'react-chartjs-2', 'recharts'],
          
          // Map libraries
          'maps': ['leaflet', 'react-leaflet', 'react-leaflet-heatmap-layer-v3'],
          
          // Markdown rendering
          'markdown': ['react-markdown', 'remark-gfm', 'rehype-raw', 'rehype-sanitize'],
          
          // Particles
          'particles': ['@tsparticles/react', '@tsparticles/slim', 'tsparticles'],
          
          // Animation
          'animation': ['framer-motion'],
          
          // Icons
          'icons': ['lucide-react'],
        },
      },
    },
    // Increase chunk size warning limit to 600kb (from default 500kb)
    chunkSizeWarningLimit: 600,
  },
})
