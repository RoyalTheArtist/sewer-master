import type { Meta, StoryObj } from '@storybook/vue3-vite';

import AppButton from '../tools/src/components/AppButton.vue';

const meta = {
  title: "Tools/Components/AppButton",
  component: AppButton,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
  },
  args: {
    label: 'Button',
  },
} satisfies Meta<typeof AppButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    label: 'Button',
  },
};
