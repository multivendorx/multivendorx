/**
 * External dependencies
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Link as RouterLink } from 'react-router-dom';

/**
 * Internal dependencies
 */
import Tabs from '../src/components/Tabs';

const meta: Meta<typeof Tabs> = {
    title: 'Zyra/Components/Tabs',
    component: Tabs,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={['/general']}>
                <Story />
            </MemoryRouter>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof Tabs>;

/**
 * Dummy tab data
 */
const tabData = [
    {
        type: 'file',
        content: {
            id: 'general',
            name: 'General',
            desc: 'General settings description',
            icon: 'settings',
        },
    },
    {
        type: 'folder',
        name: 'Advanced',
        content: [
            {
                type: 'file',
                content: {
                    id: 'advanced-one',
                    name: 'Advanced One',
                    desc: 'Advanced tab one',
                },
            },
            {
                type: 'file',
                content: {
                    id: 'advanced-two',
                    name: 'Advanced Two',
                    desc: 'Advanced tab two',
                },
            },
        ],
    },
];

/**
 * Dummy getForm renderer
 */
const getForm = (tabId: string) => {
    return (
        <div style={{ padding: 16 }}>
            <strong>Active Tab:</strong> {tabId}
        </div>
    );
};

/**
 * Dummy URL builder
 */
const prepareUrl = (tabId: string) => `/${tabId}`;

export const Basic: Story = {
    render: () => (
        <Tabs
            tabData={tabData}
            currentTab="general"
            getForm={getForm}
            prepareUrl={prepareUrl}
            Link={RouterLink}
            settingName="Settings"
            supprot={[]}
            appLocalizer={{
                khali_dabba: false,
                shop_url: 'https://example.com',
            }}
        />
    ),
};
