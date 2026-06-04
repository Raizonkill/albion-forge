/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

/**
 * Albion Online Data Project hosts — one per game server.
 * Data is fully separate per server, so the proxy exposes all three under /aod/<server>.
 * This sidesteps the CORS wall the raw API throws at browser fetches in dev.
 */
const AOD_SERVERS = {
  west: 'https://west.albion-online-data.com',
  east: 'https://east.albion-online-data.com',
  europe: 'https://europe.albion-online-data.com',
} as const

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: Object.fromEntries(
      Object.entries(AOD_SERVERS).map(([key, target]) => [
        `/aod/${key}`,
        {
          target,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(`/aod/${key}`, ''),
        },
      ]),
    ),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
