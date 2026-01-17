import type { Preview } from '@storybook/react-vite';
// import '../../../plugins/notifima/assets/css/zyra-overrides.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;