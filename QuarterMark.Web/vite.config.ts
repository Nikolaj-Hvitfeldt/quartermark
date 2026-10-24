import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // Installable app: opened from the home screen it runs full screen, without the
    // browser bar. The game needs the server, so only the app shell is cached.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'QuarterMark',
        short_name: 'QuarterMark',
        description: 'Partyspil til nytårsaften – vært på TV, spillere på mobilen',
        lang: 'da',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0c1445',
        theme_color: '#0c1445',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          // The logo sits well inside the safe zone, so the same image works when masked
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell only; game images load from the network as before
        // (the manifest, its icons and includeAssets are added by the plugin)
        globPatterns: ['**/*.{js,css,html,svg}'],
        navigateFallback: '/index.html',
        // Never answer the SignalR hub (dev proxy) with the cached page
        navigateFallbackDenylist: [/^\/gamehub/],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/gamehub': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
