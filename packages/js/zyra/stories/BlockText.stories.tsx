import BlockText from '../src/components/BlockText';
import type { Meta, StoryObj } from '@storybook/react-vite';
import "../src/styles/common.scss";

const meta: Meta<typeof BlockText> = {
    title: 'Zyra/Components/BlockText',
    component: BlockText,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof BlockText>;

export const TestBlockText: Story = {
    args: {
        blockTextClass: 'settings-metabox-description-code',
        value: 'This is a demo block of text.',
        title: 'Demo Block Text',
    },
    render: (args) => {
        return <div className='multivendorx-main-wrapper'><BlockText {...args} /></div>;
    },
};

export const NoTitle: Story = {
    args: {
        blockTextClass: 'settings-metabox-description-code',
        value: 'This block text has no title.',
        // title is intentionally omitted
    },
    render: (args) => {
        return <div className='multivendorx-main-wrapper'><BlockText {...args} /></div>;
    },
};
