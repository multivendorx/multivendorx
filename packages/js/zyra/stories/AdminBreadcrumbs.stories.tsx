import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import AdminBreadcrumbs from '../src/components/AdminBreadcrumbs';
import '../src/styles/common.scss';

const meta: Meta<typeof AdminBreadcrumbs> = {
    title: 'Zyra/Components/AdminBreadcrumbs',
    component: AdminBreadcrumbs,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AdminBreadcrumbs>;

export const Default: Story = {
    args: {
        activeTabIcon: 'adminfont-module',
        tabTitle: 'Modules',
        description:
            'Manage marketplace features by enabling or disabling modules.',
        buttons: [
            {
                label: 'Refresh',
                iconClass: 'adminfont-refresh',
                className: 'btn-purple',
                onClick: () => alert('Refresh clicked'),
                tooltip: 'Reload modules',
            },
        ],
        renderBreadcrumb: () => (
            <>
                <a href="#">Dashboard</a> / <span>Modules</span>
            </>
        ),
    },
};
