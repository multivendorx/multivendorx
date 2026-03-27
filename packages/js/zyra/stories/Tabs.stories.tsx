/**
 * External dependencies
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Link as RouterLink } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { TabsUI } from '../src/components/Tabs';
import { ZyraVariable } from '../src/components/fieldUtils';
import DashboardTab from '../../../../plugins/multivendorx/src/components/AdminDashboard/DashboardTab';
import FreeVsProTab from '../../../../plugins/multivendorx/src/components/AdminDashboard/FreeVsProTab';

const meta: Meta<typeof TabsUI> = {
    title: 'Zyra/Components/Tabs',
    component: TabsUI,
    tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof TabsUI>;

/**
 * Dummy tab data
 */
const tabData = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        icon: 'module',
        content: <DashboardTab />,
    },
    {
        key: 'free-vs-pro',
        pro: true,
        label: 'Free vs Pro',
        icon: 'pros-and-cons',
        content: <FreeVsProTab />,
    },
]

const upgradeButton = !ZyraVariable.khali_dabba && (
    <a
        href={ZyraVariable.shop_url}
        target="_blank"
        className="admin-btn btn-purple"
    >
        <i className="adminfont-pro-tag"></i>
        { 'Upgrade Now'}
        <i className="adminfont-arrow-right icon-pro-btn"></i>
    </a>
);

export const MultipleTabs: Story = {
    render: () => {
        return (
            <TabsUI
                tabs={tabData}
                className="background" 
            />
        )
    }
}

export const SingleTab: Story = {
    render: () => {
        return (
            <TabsUI
                tabs={[tabData[0]]}
                className="background" 
            />
        )
    }
}

export const TabsWithHeaderExtra: Story = {
    render: () => {
        return (
            <TabsUI
                tabs={tabData}
                className="background" 
                headerExtra={upgradeButton}
            />
        )
    }
}

export const MultipleTabsWithDefaultActiveIndex2 : Story = {
    render: ()=>{
        return (
            <TabsUI 
                tabs={tabData}
                className="background" 
                defaultActiveIndex = {2}
                headerExtra={upgradeButton}
            />
        )
    }
}

