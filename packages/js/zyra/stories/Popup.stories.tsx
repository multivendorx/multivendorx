import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ProPopup from '../src/components/Popup';

const meta: Meta<typeof ProPopup> = {
    title: 'Zyra/Components/ProPopup',
    component: ProPopup,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof ProPopup>;

const btnLinks = [
    { site: '1 Site', price: '$29', link: 'license1' },
    { site: '5 Sites', price: '$79', link: 'license5' },
];

const messages = [
    {
        text: 'Unlock premium features',
        des: 'Access advanced tools and controls.',
        icon: 'adminfont-star',
    },
    {
        text: 'Priority Support',
        des: 'Get faster help from our support team.',
        icon: 'adminfont-support',
    },
];

export const ProUpgrade: Story = {
    args: {
        title: 'Upgrade to Pro',
        moreText: 'Choose a license to unlock premium features:',
        messages,
        btnLink: btnLinks,
        upgradeBtnText: 'Upgrade Now',
    },
};