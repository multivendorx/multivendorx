// DynamicRowSetting.stories.tsx
import React, { useState } from 'react';
import DynamicRowSetting, { DynamicRowSettingProps } from '../src/components/DynamicRowSetting';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof DynamicRowSetting> = {
    title: 'Zyra/Components/DynamicRowSetting',
    component: DynamicRowSetting,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DynamicRowSetting>;

const template = {
    fields: [
        { key: 'name', type: 'text', placeholder: 'Enter name' },
        { key: 'age', type: 'number', placeholder: 'Enter age' },
        { key: 'profile', type: 'file' },
        {
            key: 'role',
            type: 'select',
            placeholder: 'Select role',
            options: [
                { label: 'Admin', value: 'admin' },
                { label: 'Editor', value: 'editor' },
                { label: 'Viewer', value: 'viewer' },
            ],
        },
    ],
};

export const Default: Story = {
    args: {
        keyName: "dynamic-row",
        template,
        value: [],
        addLabel: 'Add New Row',
        description: 'Manage dynamic rows with multiple field types.',
        onChange: (rows) => console.log('Rows changed:', rows),
    },
    render: (args) => {
        const [rows, setRows] = useState(args.value || []);

        return (
            <DynamicRowSetting
                {...args}
                value={rows}
                onChange={(updatedRows) => {
                    console.log('Updated rows:', updatedRows);
                    setRows(updatedRows);
                }}
            />
        );
    },
};

export const WithNestedRenderer: Story = {
    args: {
        keyName: 'dynamic-row-nested',
        template,
        value: [],
        addLabel: 'Add Row',
        description: 'Dynamic rows with nested children rendering.',
        childrenRenderer: (row, index) => (
            <div style={{ paddingLeft: '20px', color: '#555' }}>
                Nested info for row {index + 1}: {row.name || '(no name)'}
            </div>
        ),
        onChange: (rows) => console.log('Rows changed:', rows),
    },
    render: (args) => {
        const [rows, setRows] = useState(args.value || []);

        return (
            <DynamicRowSetting
                {...args}
                value={rows}
                onChange={(updatedRows) => setRows(updatedRows)}
            />
        );
    },
};

export const PrefilledRows: Story = {
    args: {
        keyName: 'dynamic-row-prefilled',
        template,
        addLabel: 'Add Row',
        description: 'Dynamic rows with prefilled data.',
    },
    render: (args) => {
        const [rows, setRows] = useState([
            {
                name: 'John Doe',
                age: 28,
                role: 'admin',
            },
            {
                name: 'Jane Smith',
                age: 34,
                role: 'editor',
            },
        ]);

        return (
            <DynamicRowSetting
                {...args}
                value={rows}
                onChange={(updatedRows) => setRows(updatedRows)}
            />
        );
    },
};

export const SingleRow: Story = {
    args: {
        keyName: 'dynamic-row-single',
        template,
        addLabel: 'Add Row',
        description: 'Dynamic row with a single entry.',
    },
    render: (args) => {
        const [rows, setRows] = useState([
            {
                name: 'Only User',
                age: 22,
                role: 'viewer',
            },
        ]);

        return (
            <DynamicRowSetting
                {...args}
                value={rows}
                onChange={(updatedRows) => setRows(updatedRows)}
            />
        );
    },
};

export const DeleteAllRows: Story = {
    args: {
        keyName: 'dynamic-row-delete-all',
        template,
        addLabel: 'Add Row',
        description: 'Delete all rows and add again.',
    },
    render: (args) => {
        const [rows, setRows] = useState([
            {
                name: 'User One',
                age: 30,
                role: 'admin',
            },
            {
                name: 'User Two',
                age: 26,
                role: 'editor',
            },
        ]);

        return (
            <DynamicRowSetting
                {...args}
                value={rows}
                onChange={(updatedRows) => setRows(updatedRows)}
            />
        );
    },
};

