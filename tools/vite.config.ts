import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

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
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@tools': fileURLToPath(new URL('./src', import.meta.url)),
      '@engine':fileURLToPath(new URL('../bt-engine', import.meta.url)),
    }
  }
})
