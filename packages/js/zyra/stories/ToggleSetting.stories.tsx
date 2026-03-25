/**
 * External dependencies
 */
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Internal dependencies
 */
import { ChoiceToggleUI } from '../src/components/ChoiceToggle';

const meta: Meta<typeof ChoiceToggleUI> = {
    title: 'Zyra/Components/ChoiceToggle',
    component: ChoiceToggleUI,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ChoiceToggleUI>;

/**
 * 1. Basic Single Select (Radio)
 */
export const BasicSingleSelect: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | string[]>('yes');

        function handleChange(value: string | string[]): void {
            setValue(value);
        }
        return (
            <ChoiceToggleUI
                {...args}
                value={value}
                onChange={handleChange}
            />
        );
    },
    args: {
        options: [
            { key: 'opt1', value: 'yes', label: 'Yes' },
            { key: 'opt2', value: 'no', label: 'No' },
        ],
    },
};

/**
 * 2. Multi Select (Checkbox) — STRICTMODE SAFE
 */
export const MultiSelect: Story = {
    render: (args) => {
        const [value, setValue] = useState<string[]>(['email', 'sms']);

        return (
            <ChoiceToggleUI
                {...args}
                value={value}
                onChange={(newValue) => {
                    console.log('value', value);
                    console.log('new Value', newValue);
                    setValue(() => newValue as string[]);
                }}
            />
        );
    },
    args: {
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
        const [value, setValue] = useState<string | string[]>('basic');

        return (
            <ChoiceToggleUI
                {...args}
                value={value}
                onChange={setValue}
            />
        );
    },
    args: {
        options: [
            {
                key: 'basic',
                value: 'basic',
                label: 'Basic'
            },
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
 * 4. Pro Feature Unlocked (khali_dabba)
 */
export const ProOptionUnlocked: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | string[]>('advanced');

        return (
            <ChoiceToggleUI
                {...args}
                value={value}
                onChange={setValue}
            />
        );
    },
    args: {
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
        const [value, setValue] = useState<string | string[]>('adminlib-grid');

        return (
            <ChoiceToggleUI
                {...args}
                value={value}
                onChange={setValue}
            />
        );
    },
    args: {
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
        const [value, setValue] = useState<string | string[]>('light');

        return (
            <ChoiceToggleUI
                {...args}
                value={value}
                onChange={setValue}
            />
        );
    },
    args: {
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
 * 6. custom Class Toggle
 */
export const CustomClassToggle: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | string[]>('main_sub');

        return (
            <ChoiceToggleUI
                {...args}
                value={value}
                onChange={setValue}
            />
        );
    },
    args: {
        options: [
            {
                key: 'mainorder',
                value: 'mainorder',
                label: 'Main Order (Combined)',
                desc: 'Sends a single order and invoice for the entire purchase',
                icon: 'cart',
                customHtml: `
                    <div class="choice-toggle-notice">
                        <p><strong>What it does:</strong> Sends a single order and invoice for the entire purchase.</p>
                        <p><strong>Email/Invoice:</strong> One email, one receipt with your marketplace tax details.</p>
                        <p><strong>My Account:</strong> Shows one combined order.</p>
                        <p><strong>Use this if:</strong> You want a simplified, all-in-one order view for customers.</p>
                    </div>
                    `,
            },
            {
                key: 'suborders',
                value: 'suborders',
                label: 'Sub-Orders (Per Store)',
                desc: 'Sends separate orders and invoices for each store',
                icon: 'order',
                customHtml: `
                <div class="choice-toggle-notice">
                    <p><strong>What it does:</strong> Sends separate orders and invoices for each store.</p>
                    <p><strong>Email/Invoice:</strong> Separate emails and receipts with each store’s tax details.</p>
                    <p><strong>My Account:</strong> Shows multiple orders (one per store).</p>
                    <p><strong>Use this if:</strong> You want customers to see individual store orders and receipts.</p>
                </div>
                `,
            },
            {
                key: 'main_sub',
                value: 'main_sub',
                label: 'Main + Sub Orders (Combined + Separate)',
                desc: 'Sends both a combined order and separate store orders with invoices',
                icon: 'order-completed',
                customHtml: `
                <div class="choice-toggle-notice">
                    <p><strong>What it does:</strong> Sends both a combined order and separate store orders with invoices.</p>
                    <p><strong>Email/Invoice:</strong> One email for the full order + separate emails per store; multiple receipts with marketplace and store tax details.</p>
                    <p><strong>My Account:</strong> Shows combined + individual orders.</p>
                    <p><strong>Use this if:</strong> You want full transparency for both marketplace and individual store orders.</p>
                </div>
                `,
            },
        ],
        custom: true
    },
};


