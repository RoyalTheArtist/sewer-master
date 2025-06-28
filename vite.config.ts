import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx'

import path from 'path'
import { defineConfig } from 'vite'


export default defineConfig({
  base: './',
  root: './',
  publicDir: './resources',
  plugins: [
    vue(),
    vueJsx(),
  ],
  server: {
    
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "./game"),
      '@engine': path.resolve(__dirname, "./bt-engine"),
      '@assets': path.resolve(__dirname, "./resources"),
      '@modules': path.resolve(__dirname, "./modules"),
      '@game': path.resolve(__dirname, "./game"),
    }
  }
})
