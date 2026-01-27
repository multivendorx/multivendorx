import BlockText from '../src/components/BlockText';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../src/styles/common.scss';

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
    },
    render: (args) => {
        return <BlockText {...args} />;
    },
};

export const SuccessBlockText: Story = {
    args: {
        blockTextClass: 'settings-metabox-description-code',
        value: 'This is a success block of text.',
        variant: 'success',
    },
    render: (args) => {
        return <div className='multivendorx-main-wrapper' ><BlockText {...args} /></div>;
    },
};