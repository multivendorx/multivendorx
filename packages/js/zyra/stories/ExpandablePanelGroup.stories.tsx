import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ExpandablePanelGroup from '../src/components/ExpandablePanelGroup';

const meta: Meta<typeof ExpandablePanelGroup> = {
    title: 'Zyra/Components/ExpandablePanelGroup',
    component: ExpandablePanelGroup,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ExpandablePanelGroup>;

const methods = [
    {
        id: 'general',
        icon: 'adminfont-setting',
        label: 'General Settings',
        desc: 'Configure general behavior',
        connected: true,
        disableBtn: true,
        formFields: [
            {
                key: 'enableFeature',
                type: 'checkbox',
                label: 'Enable Feature',
                desc: 'Turn this feature on or off',
            },
            {
                key: 'description',
                type: 'textarea',
                label: 'Description',
                placeholder: 'Enter description',
                rowNumber: 3,
            },
            {
                key: 'options',
                type: 'multi-checkbox',
                label: 'Options',
                selectDeselect: true,
                options: [
                    { value: 'a', label: 'Option A' },
                    { value: 'b', label: 'Option B' },
                    { value: 'c', label: 'Option C' },
                ],
            },
        ],
    },
    {
        id: 'advanced',
        icon: 'adminfont-setting',
        label: 'Advanced Settings',
        desc: 'Advanced configuration options',
        connected: false,
        disableBtn: true,
        formFields: [
            {
                key: 'mode',
                type: 'multi-select',
                label: 'Mode',
                selectType: 'multi-select',
                options: [
                    { value: 'fast', label: 'Fast' },
                    { value: 'safe', label: 'Safe' },
                ],
            },
            {
                key: 'note',
                type: 'blocktext',
                title: 'Important',
                blocktext: 'These settings affect system behavior.',
                blockTextClass: 'settings-metabox-description',
            },
        ],
    },
];

const initialValue = {
    general: {
        enable: true,
        enableFeature: true,
        description: '',
        options: ['a'],
    },
    advanced: {
        enable: false,
        mode: [],
    },
};

export const Default: Story = {
    render: (args) => {
        const [value, setValue] = useState(initialValue);

        return (
            <ExpandablePanelGroup
                {...args}
                value={value}
                onChange={(updated) => {
                    console.log('Panel value changed:', updated);
                    setValue(updated);
                }}
            />
        );
    },
    args: {
        name: 'settings',
        methods,
        value: initialValue,
        appLocalizer: {
            khali_dabba: true,
            site_url: 'https://example.com',
        },
        modules: ['analytics'],
        moduleEnabled: true,
        moduleChange: (module: string) => {
            console.log('Module required:', module);
        },
        proSetting: false,
        proChanged: () => {
            console.log('Pro feature clicked');
        },
    },
};
