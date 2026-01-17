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

const baseAppLocalizer = {
    khali_dabba: true,
    site_url: 'https://example.com',
};

const baseModules = ['analytics'];

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

export const SinglePanel: Story = {
    render: () => {
        const [value, setValue] = useState({
            general: {
                enable: true,
                enableFeature: false,
            },
        });

        return (
            <ExpandablePanelGroup
                name="single"
                methods={[methods[0]]}
                value={value}
                onChange={setValue}
                appLocalizer={baseAppLocalizer}
                modules={baseModules}
                moduleEnabled
                moduleChange={() => {}}
            />
        );
    },
};

export const ProLockedPanel: Story = {
    render: () => {
        const [value] = useState(initialValue);

        return (
            <ExpandablePanelGroup
                name="pro-locked"
                methods={[
                    {
                        ...methods[0],
                        proSetting: true,
                    },
                ]}
                value={value}
                onChange={() => {}}
                appLocalizer={{ ...baseAppLocalizer, khali_dabba: false }}
                modules={baseModules}
                moduleEnabled
                moduleChange={() => {}}
                proChanged={() => {
                    console.log('Upgrade to Pro popup triggered');
                }}
            />
        );
    },
};

export const ProUnlockedPanel: Story = {
    render: () => {
        const [value, setValue] = useState(initialValue);

        return (
            <ExpandablePanelGroup
                name="pro-unlocked"
                methods={[
                    {
                        ...methods[0],
                        proSetting: false, 
                    },
                ]}
                value={value}
                onChange={(updated) => {
                    console.log('Pro unlocked value changed:', updated);
                    setValue(updated);
                }}
                appLocalizer={{
                    ...baseAppLocalizer,
                    khali_dabba: true,
                }}
                modules={baseModules}
                moduleEnabled
                moduleChange={() => {}}
                proChanged={() => {
                    console.log('This should NOT be triggered in Pro unlocked');
                }}
            />
        );
    },
};


export const AddNewCustomPanel: Story = {
    render: () => {
        const defaultMethodId = 'custom_method_1';

        const [value, setValue] = useState({
            [defaultMethodId]: {
                title: 'Default Custom Method',
                description: 'This is a default custom panel',
                required: false,
            },
        });

        return (
            <ExpandablePanelGroup
                name="custom"
                methods={[
                    {
                        id: defaultMethodId,
                        icon: 'adminfont-setting',
                        label: 'Default Custom Method',
                        desc: 'This is a default custom panel',
                        connected: false,
                        isCustom: true, // ✅ REQUIRED for Edit + Delete
                        formFields: [
                            {
                                key: 'title',
                                type: 'text',
                                label: 'Title',
                                placeholder: 'Enter panel title',
                            },
                            {
                                key: 'description',
                                type: 'textarea',
                                label: 'Description',
                                placeholder: 'Enter panel description',
                                rowNumber: 3,
                            },
                            {
                                key: 'required',
                                type: 'checkbox',
                                label: 'Required',
                                desc: 'Mark this section as required',
                            },
                        ],
                    },
                ]}
                value={value}
                onChange={(updated) => {
                    console.log('Custom panel value:', updated);
                    setValue(updated);
                }}
                appLocalizer={baseAppLocalizer}
                modules={baseModules}
                moduleEnabled
                moduleChange={() => {}}
                addNewBtn
                addNewTemplate={{
                    icon: 'adminfont-setting',
                    label: 'Custom Method',
                    desc: 'Custom description',
                    formFields: [
                        {
                            key: 'title',
                            type: 'text',
                            label: 'Title',
                            placeholder: 'Enter panel title',
                        },
                        {
                            key: 'description',
                            type: 'textarea',
                            label: 'Description',
                            placeholder: 'Enter panel description',
                            rowNumber: 3,
                        },
                        {
                            key: 'required',
                            type: 'checkbox',
                            label: 'Required',
                            desc: 'Mark this section as required',
                        },
                    ],
                }}
            />
        );
    },
};

export const SetupWizard: Story = {
    render: () => {
        const [value, setValue] = useState({
            step_one: {
                enable: true,
                siteName: '',
            },
            step_two: {
                enable: true,
                email: '',
            },
            step_three: {
                enable: true,
                confirm: false,
            },
        });

        return (
            <ExpandablePanelGroup
                name="setup-wizard"
                isWizardMode
                methods={[
                    {
                        id: 'step_one',
                        icon: 'adminfont-setting',
                        label: 'Step 1: Basic Info',
                        desc: 'Configure basic settings',
                        connected: true,
                        isWizardMode: true,
                        openForm: true,
                        formFields: [
                            {
                                key: 'siteName',
                                type: 'text',
                                label: 'Site Name',
                                placeholder: 'Enter site name',
                            },
                            {
                                key: 'wizardButtons',
                                type: 'buttons',
                                options: [
                                    {
                                        label: 'Next',
                                        action: 'next',
                                        btnClass: 'admin-btn btn-purple',
                                    },
                                ],
                            },
                        ],
                    },

                    {
                        id: 'step_two',
                        icon: 'adminfont-setting',
                        label: 'Step 2: Contact Info',
                        desc: 'Set contact details',
                        connected: false,
                        isWizardMode: true,
                        openForm: true,
                        formFields: [
                            {
                                key: 'email',
                                type: 'text',
                                label: 'Admin Email',
                                placeholder: 'Enter admin email',
                            },
                            {
                                key: 'wizardButtons',
                                type: 'buttons',
                                options: [
                                    {
                                        label: 'Back',
                                        action: 'back',
                                        btnClass: 'admin-btn btn-secondary',
                                    },
                                    {
                                        label: 'Next',
                                        action: 'next',
                                        btnClass: 'admin-btn btn-purple',
                                    },
                                ],
                            },
                        ],
                    },

                    {
                        id: 'step_three',
                        icon: 'adminfont-setting',
                        label: 'Step 3: Finish',
                        desc: 'Confirm setup',
                        connected: false,
                        isWizardMode: true,
                        openForm: true,
                        formFields: [
                            {
                                key: 'confirm',
                                type: 'checkbox',
                                label: 'Confirm Setup',
                                desc: 'I confirm all details are correct',
                            },
                            {
                                key: 'wizardButtons',
                                type: 'buttons',
                                options: [
                                    {
                                        label: 'Back',
                                        action: 'back',
                                        btnClass: 'admin-btn btn-secondary',
                                    },
                                    {
                                        label: 'Finish',
                                        action: 'next',
                                        btnClass: 'admin-btn btn-purple',
                                        redirect: 'https://example.com',
                                    },
                                ],
                            },
                        ],
                    },
                ]}
                value={value}
                onChange={(updated) => {
                    console.log('Wizard value:', updated);
                    setValue(updated);
                }}
                appLocalizer={{
                    khali_dabba: true,
                    site_url: 'https://example.com',
                }}
                modules={[]}
                moduleEnabled
                moduleChange={() => {}}
            />
        );
    },
};
