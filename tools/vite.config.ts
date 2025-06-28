import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  plugins: [
    vue(),
    vueJsx(),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "./tools/src"),
      '@engine': path.resolve(__dirname, "./bt-engine"),
      '@assets': path.resolve(__dirname, "./resources"),
      '@game': path.resolve(__dirname, "./game"),
      '@modules': path.resolve(__dirname, "./modules"),
    }
  }
})
