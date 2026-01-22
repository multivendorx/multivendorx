/**
 * External dependencies
 */
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Internal dependencies
 */
import ToggleSetting from '../src/components/ToggleSetting';

const meta: Meta<typeof ToggleSetting> = {
    title: 'Zyra/Components/ToggleSetting',
    component: ToggleSetting,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ToggleSetting>;

/**
 * 1. Basic Single Select (Radio)
 */
export const BasicSingleSelect: Story = {
    render: (args) => {
        const [value, setValue] = useState<string>('yes');

        return (
            <ToggleSetting
                {...args}
                value={value}
                onChange={setValue}
            />
        );
    },
    args: {
        description: 'Choose your preferred option',
        options: [
            { key: 'opt1', value: 'yes', label: 'Yes' },
            { key: 'opt2', value: 'no', label: 'No' },
        ],
        descClass: 'settings-metabox-description',
    },
};

/**
 * 2. Multi Select (Checkbox) — STRICTMODE SAFE
 */
export const MultiSelect: Story = {
    render: (args) => {
        const [value, setValue] = useState<string[]>(['email','sms']);

        return (
            <ToggleSetting
                {...args}
                value={value}
                onChange={(newValue) => {
                    console.log('value',value);
                    console.log('new Value',newValue);
                    setValue(() => newValue as string[]);
                }}
            />
        );
    },
    args: {
        description: 'Select notification channels',
        multiSelect: true,
        options: [
            { key: 'email', value: 'email', label: 'Email' },
            { key: 'sms', value: 'sms', label: 'SMS' },
            { key: 'push', value: 'push', label: 'Push Notification' },
        ],
    },
};


/**
 * 3. Pro Feature Locked
 */
export const ProOptionLocked: Story = {
    render: (args) => {
        const [value, setValue] = useState('basic');

        return (
            <ToggleSetting
                {...args}
                value={value}
                onChange={setValue}
            />
        );
    },
    args: {
        description: 'Advanced settings (Pro required)',
        options: [
            { key: 'basic', value: 'basic', label: 'Basic' },
            {
                key: 'advanced',
                value: 'advanced',
                label: 'Advanced',
                proSetting: true,
            },
        ],
        proChanged: () => {
            alert('This is a Pro feature');
        },
    },
};

/**
 * 4. Pro Feature Unlocked (khali_dabba)
 */
export const ProOptionUnlocked: Story = {
    render: (args) => {
        const [value, setValue] = useState('advanced');

        return (
            <ToggleSetting
                {...args}
                value={value}
                onChange={setValue}
            />
        );
    },
    args: {
        description: 'Advanced settings unlocked',
        khali_dabba: true,
        options: [
            { key: 'basic', value: 'basic', label: 'Basic' },
            {
                key: 'advanced',
                value: 'advanced',
                label: 'Advanced',
                proSetting: true,
            },
        ],
    },
};

/**
 * 5. Icon Based Toggle
 */
export const IconToggle: Story = {
    render: (args) => {
        const [value, setValue] = useState('adminlib-grid');

        return (
            <ToggleSetting
                {...args}
                value={value}
                onChange={setValue}
            />
        );
    },
    args: {
        description: 'Choose layout style',
        iconEnable: true,
        options: [
            { key: 'grid', value: 'adminlib-grid', label: 'Grid' },
            { key: 'list', value: 'adminlib-list', label: 'List' },
        ],
    },
};

/**
 * 6. Image Based Toggle
 */
export const ImageToggle: Story = {
    render: (args) => {
        const [value, setValue] = useState('light');

        return (
            <ToggleSetting
                {...args}
                value={value}
                onChange={setValue}
            />
        );
    },
    args: {
        description: 'Select theme style',
        options: [
            {
                key: 'light',
                value: 'light',
                label: 'Light',
                img: 'https://via.placeholder.com/40x40?text=L',
            },
            {
                key: 'dark',
                value: 'dark',
                label: 'Dark',
                img: 'https://via.placeholder.com/40x40?text=D',
            },
        ],
    },
};

/**
 * 7. With Prefix & Suffix Text
 */
export const WithPreAndPostText: Story = {
    render: (args) => {
        const [value, setValue] = useState('on');

        return (
            <ToggleSetting
                {...args}
                value={value}
                onChange={setValue}
            />
        );
    },
    args: {
        preText: 'Enable',
        postText: 'mode',
        options: [
            { key: 'on', value: 'on', label: 'On' },
            { key: 'off', value: 'off', label: 'Off' },
        ],
    },
};

export const CustomLayout: Story = {
    render: (args) => {
        const [value, setValue] = useState('left');

        return (
            <ToggleSetting
                {...args}
                value={value}
                onChange={setValue}
            />
        );
    },
    args: {
        custom: true,
        description: 'Custom styled toggle layout',
        options: [
            { key: 'left', value: 'left', label: 'Left' },
            { key: 'right', value: 'right', label: 'Right' },
        ],
    },
};

export const OptionWithDescription: Story = {
    render: (args) => {
        const [value, setValue] = useState('standard');

        return (
            <ToggleSetting
                {...args}
                value={value}
                onChange={setValue}
            />
        );
    },
    args: {
        description: 'Choose plan type',
        options: [
            {
                key: 'standard',
                value: 'standard',
                label: 'Standard',
                desc: 'Basic features included',
            },
            {
                key: 'premium',
                value: 'premium',
                label: 'Premium',
                desc: 'Advanced features + priority support',
            },
        ],
    },
};

export const EmptyOptions: Story = {
    render: () => (
        <ToggleSetting
            value=""
            onChange={() => {}}
            options={[]}
            description="No options available"
        />
    ),
};



