import Modules from '../src/components/Modules';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

// Mock Modules Context
const MockModulesProvider = ({ children }: { children: React.ReactNode }) => {
  const [modules, setModules] = React.useState<string[]>([]);

  const insertModule = (id: string) => setModules((prev) => [...prev, id]);
  const removeModule = (id: string) =>
    setModules((prev) => prev.filter((mod) => mod !== id));

  const contextValue = {
    modules,
    insertModule,
    removeModule,
  };

  // Provide context to children
  const ModuleContext = require('../src/contexts/ModuleContext').ModuleContext;
  return <ModuleContext.Provider value={contextValue}>{children}</ModuleContext.Provider>;
};

const meta: Meta<typeof Modules> = {
  title: 'Zyra/Components/Modules',
  component: Modules,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Modules>;

// Mock data
const modulesArray = {
  category: true,
  modules: [
    {
      id: 'analytics',
      name: 'Analytics Tracker',
      desc: 'Track user behavior and site metrics.',
      icon: 'adminlib-mail',
      doc_link: 'https://docs.example.com/modules/analytics',
      settings_link: '/settings/analytics',
      pro_module: false,
    },
    {
      id: 'cache',
      name: 'Cache Booster',
      desc: 'Speed up your website with smart caching.',
      icon: 'adminlib-mail',
      doc_link: 'https://docs.example.com/modules/cache',
      settings_link: '/settings/cache',
      pro_module: true,
    },
    {
      id: 'seo',
      name: 'SEO Optimizer',
      desc: 'Improve your search engine visibility.',
      icon: 'adminlib-mail',
      doc_link: 'https://docs.example.com/modules/seo',
      settings_link: '/settings/seo',
      pro_module: false,
    },
  ],
};

export const TestModules: Story = {
  render: (args) => (
    <MockModulesProvider>
      <Modules {...args} />
    </MockModulesProvider>
  ),
  args: {
    modulesArray,
    apiLink: '/fake-api',
    pluginName: 'my-plugin',
    brandImg: '/logo.png',
    appLocalizer: {
      khali_dabba: false,
      nonce: 'fake-nonce',
      apiUrl: '/api',
      restUrl: '/rest',
    },
    proPopupContent: () => <div>Pro Module Popup</div>,
  },
};
