// Banner.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Banner from '../src/components/Banner';

const meta: Meta<typeof Banner> = {
    title: 'Zyra/Components/Banner',
    component: Banner,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Banner>;

// Sample products
const sampleProducts = [
    {
        title: 'Product 1',
        description: 'Description for product 1',
    },
    {
        title: 'Product 2',
        description: 'Description for product 2',
    },
    {
        title: 'Product 3',
        description: 'Description for product 3',
    },
];

export const DefaultBanner: Story = {
    render: () => (
        <Banner
            isPro={false}
            tag="Top Banner"
            buttonText="Upgrade Now"
            bgCode="#f5f5f5"
            textCode="#333333"
            btnCode="#ffffff"
            btnBgCode="#ff0000"
            products={sampleProducts}
            proUrl="https://example.com/pro"
        />
    ),
};

export const BannerWithPro: Story = {
    render: () => (
        <Banner
            isPro={true}
            tag="Top Banner"
            buttonText="Upgrade Now"
            bgCode="#f5f5f5"
            textCode="#333333"
            btnCode="#ffffff"
            btnBgCode="#ff0000"
            products={sampleProducts}
            proUrl="https://example.com/pro"
        />
    ),
};

export const BannerWithoutProducts: Story = {
    render: () => (
        <Banner
            tag="Top Banner"
            buttonText="Upgrade Now"
            bgCode="#f5f5f5"
            textCode="#333333"
            btnCode="#ffffff"
            btnBgCode="#ff0000"
        />
    ),
};

export const BannerWithoutPro: Story = {
    render: () => (
        <Banner
            isPro={false}
            tag="Top Banner"
            buttonText="Upgrade Now"
            bgCode="#f5f5f5"
            textCode="#333333"
            btnCode="#ffffff"
            btnBgCode="#ff0000"
            products={sampleProducts}
            proUrl="https://example.com/pro"
        />
    ),
};