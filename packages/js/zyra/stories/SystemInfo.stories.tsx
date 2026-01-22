/**
 * External dependencies
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Internal dependencies
 */
import SystemInfo from '../src/components/SystemInfo';

const meta: Meta<typeof SystemInfo> = {
    title: 'Zyra/Components/SystemInfo',
    component: SystemInfo,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof SystemInfo>;

const mockSystemInfo = {
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
    multivendorx: {
        label: 'MultiVendorX',
        fields: {
            version: {
                label: 'Version',
                value: '4.2.50',
            },
            plan: {
                label: 'Plugin subscription plan',
                value: 'Free',
            },
            modules: {
                label: 'Active modules',
                value:
                    'geo-location, marketplace-refund, announcement, privacy',
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
};

export const Default: Story = {
    args: {
        apiLink: '/system-info',
        appLocalizer: {
            nonce: 'dummy-nonce',
            apiUrl: 'https://example.com/wp-json/',
            restUrl: 'https://example.com/wp-json/',
        },
        copyButtonLabel: 'Copy All',
        copiedLabel: 'Copied!',
        initialData: mockSystemInfo,
    },
};
