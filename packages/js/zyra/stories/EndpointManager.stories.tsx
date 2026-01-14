// EndpointManager.stories.tsx
import React, { useState } from 'react';
import EndpointManager from '../src/components/EndpointEditor';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof EndpointManager> = {
    title: 'Zyra/Components/EndpointManager',
    component: EndpointManager,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof EndpointManager>;

const mockAppLocalizer = {
    nonce: '12345',
    apiUrl: 'https://example.com/wp-json',
    restUrl: 'https://example.com/wp-json',
};

export const Default: Story = {
    args: {
        name: 'default-endpoint-manager',
        apilink: '/mock-endpoints',
        appLocalizer: mockAppLocalizer,
    },
    render: (args) => {
        const [data, setData] = useState({});
        return (
            <EndpointManager
                {...args}
                onChange={(updated) => {
                    console.log('Updated endpoints:', updated);
                    setData(updated);
                }}
            />
        );
    },
};

export const WithProSettings: Story = {
    args: {
        name: 'pro-endpoint-manager',
        apilink: '/mock-endpoints',
        appLocalizer: mockAppLocalizer,
        proSetting: true,
        proSettingChanged: () => true,
    },
    render: (args) => {
        const [data, setData] = useState({});
        return (
            <EndpointManager
                {...args}
                onChange={(updated) => {
                    console.log('Updated endpoints (Pro):', updated);
                    setData(updated);
                }}
            />
        );
    },
};
