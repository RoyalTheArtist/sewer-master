import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx'

import path from 'path'
import { defineConfig } from 'vite'


export default defineConfig({
  base: './',
  root: './tools',
  publicDir: '../resources',
  build: {
    rollupOptions: {
      input: {
        app: './tools/index.html'
      }
    }
  },
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
