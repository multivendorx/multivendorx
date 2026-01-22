import MultiCheckboxTable from '../src/components/MultiCheckboxTable';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof MultiCheckboxTable> = {
    title: 'Zyra/Components/MultiCheckboxTable',
    component: MultiCheckboxTable,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MultiCheckboxTable>;
const rows = [
    {
        key: 'trackUsers',
        label: 'Track Logged-in Users',
        options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
        ],
    },
    {
        key: 'enableEvents',
        label: 'Enable Event Tracking',
        options: [
            { value: 1, label: 'Enabled' },
            { value: 0, label: 'Disabled' },
        ],
    },
    {
        key: 'anonymizeIp',
        label: 'Anonymize IP Address',
    },
];

const columns = [
    {
        key: 'default',
        label: 'Default Settings',
    },
    {
        key: 'pro',
        label: 'Pro Settings',
        moduleEnabled: 'analytics',
    },
];

export const TestMultiCheckboxTable: Story = {
    args: {
        rows,
        columns,
        description: 'Configure analytics and tracking settings below.',
        onChange: (key: string, value: any) => {
            console.log(`Setting changed: ${key} = ${value}`);
        },
        setting: {
            trackUsers: 'yes',
            enableEvents: 1,
            anonymizeIp: true,
        },
        proSetting: false,
        modules: ['analytics', 'events'],
        moduleChange: (module: string) => {
            console.log(`Module toggled: ${module}`);
        },
    },
    render: (args) => {
        return <MultiCheckboxTable {...args} />;
    },
};

export const PrefilledValues: Story = {
    args: {
        rows,
        columns,
        setting: {
            default: ['trackUsers'],
            pro: ['enableEvents'],
            default_trackUsers: [{ value: 'yes', label: 'Yes' }],
            default_enableEvents: [{ value: 1, label: 'Enabled' }],
            pro_trackUsers: [{ value: 'no', label: 'No' }],
            pro_enableEvents: [{ value: 0, label: 'Disabled' }],
        },
        onChange: console.log,
        modules: ['analytics'],
        storeTabSetting: {},
        moduleChange: console.log,
        khali_dabba: false,
    },
};

export const ProUnlocked: Story = {
    args: {
        rows,
        columns,
        description: 'Pro settings are unlocked. Configure analytics and tracking settings below.',
        onChange: (key: string, value: any) => {
            console.log(`Setting changed: ${key} = ${value}`);
        },
        setting: {
            default: ['trackUsers'],
            pro_trackUsers: [{ value: 'yes', label: 'Yes' }],
            pro_enableEvents: [{ value: 0, label: 'Disabled' }],
            pro_anonymizeIp: [{ value: 'true', label: 'True' }],
        },
        proSetting: true,
        khali_dabba: true,
    },
    render: (args) => {
        return <MultiCheckboxTable {...args} />;
    },
};
