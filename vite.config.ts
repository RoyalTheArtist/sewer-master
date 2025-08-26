/// <reference types="vitest/config" />
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  base: './',
  root: './',
  publicDir: './resources',
  plugins: [vue(), vueJsx()],
  server: { open: true, host: true, port: 3000 },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "./game"),
      '@engine': path.resolve(__dirname, "./bt-engine"),
      '@assets': path.resolve(__dirname, "./resources"),
      '@modules': path.resolve(__dirname, "./modules"),
      '@game': path.resolve(__dirname, "./game")
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
});