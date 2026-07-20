// BlockLayout.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import BlockLayout from '../src/components/BlockLayout';

const meta: Meta<typeof BlockLayout> = {
    title: 'Zyra/Components/BlockLayout',
    component: BlockLayout,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BlockLayout>;

export const DefaultLayout: Story = {
    render: () => <BlockLayout />,
};

export const WithHeadingAndText: Story = {
    render: () => <BlockLayout />,
};

export const AddImageBlock: Story = {
    render: () => <BlockLayout />,
};

export const WithSpacerBlock: Story = {
    render: () => <BlockLayout />,
};
