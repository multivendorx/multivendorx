import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { BasicInputUI } from '../src/components/BasicInput';

const meta: Meta<typeof BasicInputUI> = {
    title: 'Zyra/Components/BasicInput',
    component: BasicInputUI,
    tags: ['autodocs'],
    args: {
        value: '',
        onChange: () => { },
    },
};

export default meta;

type Story = StoryObj<typeof BasicInputUI>;

const ControlledTemplate = (
    args: React.ComponentProps<typeof BasicInputUI>
) => {
    const [value, setValue] = useState(args.value);

    return (
        <div style={{ maxWidth: '420px', padding: '16px' }}>
            <BasicInputUI
                {...args}
                value={value}
                onChange={(nextValue) => {
                    setValue(nextValue);
                }}
            />
        </div>
    );
};

export const Default: Story = {
    render: (args) => <ControlledTemplate {...args} />,
    
    args: {
        id: 'basic-input-default',
        type: 'text',
        value: '',
        inputLabel: 'Store Name',
        name: 'store_name',
        placeholder: 'Enter store name',
    },
};

export const WithPreAndPostText: Story = {
    render: (args) => <ControlledTemplate {...args} />,

    args: {
        id: 'basic-input-price',
        inputLabel: 'Commission',
        name: 'commission',
        type: 'number',
        value: '25',
        preText: '$',
        postText: '<strong>USD</strong>',
        minNumber: 0,
        maxNumber: 100,
    },
};

export const NumberInput: Story = {
    render: (args) => <ControlledTemplate {...args} />,

    args: {
        id: 'basic-input-number',
        inputLabel: 'Number Input(Zip code)',
        name: 'zip_code',
        type: 'number',
        value: '700064',
        placeholder: 'Enter zip code',
        minNumber: 0,
        maxNumber: 999999,
    },
};

export const PasswordInput: Story = {
    render: (args) => <ControlledTemplate {...args} />,

    args: {
        id: 'basic-input-password',
        type: 'password',
        name: 'password',
        placeholder: 'password must be strong',
        value: '',
        required: true,
        inputLabel: 'Password',
        onChange: () => { },
    },
};

export const EmailInput: Story = {
    render: (args) => <ControlledTemplate {...args} />,

    args: {
        id: 'basic-input-email',
        type: 'email',
        name: 'email',
        placeholder: 'Enter your Email',
        value: '',
        inputLabel: 'Email',
        onChange: () => { },
    },
};

export const ColorInput: Story = {
    render: (args) => <ControlledTemplate {...args} />,

    args: {
        id: 'basic-input-color',
        type: 'color',
        name: 'brand_color',
        value: '#3b82f6',
        required: false,
        inputLabel: 'Brand Color',
        onChange: () => { },
    },
};

export const RangeInput: Story = {
    render: (args) => <ControlledTemplate {...args} />,

    args: {
        id: 'basic-input-range',
        type: 'range',
        name: 'shipping_radius',
        value: 25,
        inputLabel: 'Shipping Radius',
        minNumber: 0,
        maxNumber: 100,
        onChange: () => { },
        rangeUnit: 'km',
    },
};

export const Disabled: Story = {
    render: (args) => <ControlledTemplate {...args} />,

    args: {
        id: 'basic-input-disabled',
        type: 'text',
        name: 'store_name_disabled',
        value: 'multivendorx store',
        inputLabel: 'Store Name',
        disabled: true,
        onChange: () => { },
    },
};

export const ReadOnly: Story = {
    render: (args) => <ControlledTemplate {...args} />,

    args: {
        id: 'basic-input-readonly',
        type: 'text',
        name: 'api_key',
        value: 'mvx_demo_key_12345',
        inputLabel: 'API KEY',
        readOnly: true,
        onChange: () => { },
    },
};


