import MultipleOptions from '../src/components/MultipleOption';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof MultipleOptions> = {
    title: 'Zyra/Components/MultipleOptions',
    component: MultipleOptions,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MultipleOptions>;
const options = [
    { id: 'opt1', label: 'Option A', value: 'A', isdefault: true },
    { id: 'opt2', label: 'Option B', value: 'B' },
    { id: 'opt3', label: 'Option C', value: 'C' },
];

const formField = {
    id: 101,
    type: 'dropdown',
    label: 'Select an Option',
    required: true,
    name: 'selection',
    placeholder: 'Choose one',
    options,
};

export const TestDefault: Story = {
    args: {
        formField,
        onChange: (key, value) => {
            console.log(`Field ${key} changed to`, value);
        },
        type: 'dropdown',
        selected: true,
    },
    render: (args) => {
        return <MultipleOptions {...args} />;
    },
};

export const TestRadio: Story = {
    args: {
        formField,
        onChange: (key, value) => {
            console.log(`Field ${key} changed to`, value);
        },
        type: 'radio',
        selected: false,
    },
    render: (args) => {
        return <MultipleOptions {...args} />;
    },
};

export const TestCheckbox: Story = {
    args: {
        formField,
        onChange: (key, value) => {
            console.log(`Field ${key} changed to`, value);
        },
        type: 'checkboxes',
        selected: false,
    },
    render: (args) => {
        return <MultipleOptions {...args} />;
    },
};

