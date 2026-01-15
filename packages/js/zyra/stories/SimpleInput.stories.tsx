import React from 'react';
import SimpleInput from '../src/components/SimpleInput';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof SimpleInput> = {
    title: 'Zyra/Components/Form/SimpleInput',
    component: SimpleInput,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SimpleInput>;

export const TestSimpleInput: Story = {
    args: {
        formField: {
            label: 'Email',
            placeholder: 'Enter your email',
        },
        // Logs the field change in the console
        onChange: (field, value) => {
            console.log(`Field ${field} changed to`, value);
        },
    },
    // No need to wrap in extra function; can pass args directly
    render: (args) => <SimpleInput {...args} />,
};

export const SimpleInputWithNoPlaceholder: Story = {
    args: {
        formField: {
            label: 'Username',
        },
        onChange: (field, value) => {
            console.log(`Field ${field} changed to`, value);
        },
    },
    render: (args) => <SimpleInput {...args} />,
};

export const EmptyLabel: Story = {
    args: {
        formField: {
            label: '',
            placeholder: 'Enter value',
        },
        onChange: console.log,
    },
};
