import Label from '../src/components/Label';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Label> = {
    title: 'Zyra/Components/Label',
    component: Label,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Label>;

export const TestLabel: Story = {
    args: {
        wrapperClass: 'form-group-only-label',
        descClass: 'settings-metabox-description',
        description: 'This is a sample label description.',
        value: 'Label Text',
    },
    render: (args) => {
        return <Label {...args} />;
    },
};

export const WithoutDescription: Story = {
    args: {
        wrapperClass: 'form-group-only-label',
        descClass: 'settings-metabox-description',
        value: 'Label Without Description',
    },
    render: (args) => {
        return <Label {...args} />;
    },
};

export const WithoutLabel: Story = {
    args: {
        wrapperClass: 'form-group-only-label',
        descClass: 'settings-metabox-description',
        description: 'This is a sample description without a label.',
    },
    render: (args) => {
        return <Label {...args} />;
    },
};
