/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Internal dependencies
 */
import Modules from '../src/components/Modules';
import { useModules } from '../src/contexts/ModuleContext';

const meta: Meta<typeof Modules> = {
    title: 'Zyra/Components/Modules',
    component: Modules,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modules>;

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

export const Default: Story = {
    render: (args) => {
        useEffect(() => {
            useModules.setState({
                modules: ['analytics'],
            });

            return () => {
                useModules.setState({ modules: [] });
            };
        }, []);

        return <Modules {...args} />;
    },
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
        proPopupContent: () => <p>Pro Module Popup</p>,
    },
};
