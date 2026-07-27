import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Deploy target: GitHub Pages at https://<owner>.github.io/i-miei-pensieri/
const base = process.env.VITE_BASE_PATH ?? '/i-miei-pensieri/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'I Miei Pensieri',
        short_name: 'Pensieri',
        description: 'Raccolta privata dei tuoi pensieri, organizzati per tema con mappa mentale.',
        theme_color: '#f6efff',
        background_color: '#faf7ff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://www.googleapis.com',
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
})
