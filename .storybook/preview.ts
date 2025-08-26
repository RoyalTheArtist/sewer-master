import type { Preview } from '@storybook/vue3-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import '../tools/src/style/main.scss';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'theme theme-pixel',
        dark: 'theme-dark'
      },
      defaultTheme: 'light'
    })
  ]
};

export default preview;