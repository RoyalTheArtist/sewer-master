import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx'

import path from 'path'
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite'
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

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
  },
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: 'playwright',
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['.storybook/vitest.setup.ts']
      }
    }]
  }
})
