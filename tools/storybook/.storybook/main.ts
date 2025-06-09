import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    // '../../../plugins/notifima/src/**/stories/*.stories.@(js|ts|tsx)',
    '../../../packages/js/zyra/**/stories/*.stories.@(js|ts|tsx)'
  ],
  "addons": [
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
    "@storybook/experimental-addon-test"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  }
};
export default config;