import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  "stories": [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "@storybook/addon-themes"
  ],
  "framework": {
    "name": "@storybook/vue3-vite",
    "options": {}
  },
  core: {
    "builder": {
      name: "@storybook/builder-vite",
      options: {
        viteConfigPath: "./tools.config.ts"
      }
    }
  }
};
export default config;