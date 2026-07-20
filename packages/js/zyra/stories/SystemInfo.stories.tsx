/**
 * External dependencies
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import axios from 'axios';

/**
 * Internal dependencies
 */
import SystemInfo from '../src/components/SystemInfo';

/**
 * ✅ Mock axios DEFAULT call (axios(config))
 */
(axios as any) = (config: any) => {
    return Promise.resolve({
        data: {
            wordpress: {
                label: 'WordPress Environment',
                description: 'Information about WordPress setup',
                fields: {
                    version: {
                        label: 'WordPress Version',
                        value: '6.5.2',
                    },
                    site_url: {
                        label: 'Site URL',
                        value: 'https://example.com',
                    },
                },
            },
            server: {
                label: 'Server Environment',
                fields: {
                    php_version: {
                        label: 'PHP Version',
                        value: '8.1.12',
                    },
                    mysql_version: {
                        label: 'MySQL Version',
                        value: '8.0',
                    },
                },
            },
        },
    });
};

const meta: Meta<typeof SystemInfo> = {
    title: 'Zyra/Components/SystemInfo',
    component: SystemInfo,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SystemInfo>;

export const Basic: Story = {
    args: {
        apiLink: '/system-info',
        appLocalizer: {
            nonce: 'dummy-nonce',
            apiUrl: 'https://example.com/wp-json/',
            restUrl: 'https://example.com/wp-json/',
        },
        copyButtonLabel: 'Copy System Info',
        copiedLabel: 'Copied!',
    },
};
