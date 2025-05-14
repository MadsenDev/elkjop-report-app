import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        '@tauri-apps/api/fs',
        '@tauri-apps/api/path',
        '@tauri-apps/api/dialog',
        '@tauri-apps/api/notification',
        '@tauri-apps/api/shell',
        '@tauri-apps/api/window',
        '@tauri-apps/api/app',
        '@tauri-apps/api/cli',
        '@tauri-apps/api/core',
        '@tauri-apps/api/globalShortcut',
        '@tauri-apps/api/http',
        '@tauri-apps/api/menu',
        '@tauri-apps/api/process',
        '@tauri-apps/api/updater',
        '@tauri-apps/api/event',
        '@tauri-apps/api/fs-watch',
        '@tauri-apps/api/security',
        '@tauri-apps/api/store',
        '@tauri-apps/api/theme',
        '@tauri-apps/api/updater',
        '@tauri-apps/api/websocket',
      ],
    },
  },
  resolve: {
    alias: {
      '@tauri-apps/api': path.resolve(__dirname, 'node_modules/@tauri-apps/api/dist/index.js'),
      '@tauri-apps/api/path': path.resolve(__dirname, 'node_modules/@tauri-apps/api/dist/index.js/path'),
      '@tauri-apps/api/core': path.resolve(__dirname, 'node_modules/@tauri-apps/api/dist/index.js/core'),
    },
  },
})
