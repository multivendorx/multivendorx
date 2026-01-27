import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import NestedComponent from '../src/components/NestedComponent';

const meta: Meta<typeof NestedComponent> = {
    title: 'Zyra/Components/NestedComponent',
    component: NestedComponent,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NestedComponent>;

const nestedFields = [
    {
        key: 'name',
        type: 'text',
        label: 'Name',
        placeholder: 'Enter name',
    },
    {
        key: 'email',
        type: 'text',
        label: 'Email',
        placeholder: 'Enter email',
    },
    {
        key: 'role',
        type: 'dropdown',
        label: 'Role',
        options: [
            { value: 'admin', label: 'Admin' },
            { value: 'editor', label: 'Editor' },
            { value: 'viewer', label: 'Viewer' },
        ],
    },
];

export const Default: Story = {
    render: (args) => {
        const [value, setValue] = useState([]);

        return (
            <NestedComponent
                {...args}
                value={value}
                onChange={(updated) => {
                    console.log('Nested value:', updated);
                    setValue(updated);
                }}
            />
        );
    },
    args: {
        id: 'default-nested',
        label: 'Users',
        fields: nestedFields,
        addButtonLabel: 'Add User',
        deleteButtonLabel: 'Delete',
        single: false,
    },
};

export const SingleRow: Story = {
    render: (args) => {
        const [value, setValue] = useState([]);

        return (
            <NestedComponent
                {...args}
                value={value}
                onChange={setValue}
            />
        );
    },
    args: {
        id: 'single-nested',
        label: 'Single User',
        fields: nestedFields,
        single: true,
    },
};

export const PreFilled: Story = {
    render: (args) => {
        const [value, setValue] = useState([
            {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'admin',
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: 'editor',
            },
        ]);

        return (
            <NestedComponent
                {...args}
                value={value}
                onChange={setValue}
            />
        );
    },
    args: {
        id: 'prefilled-nested',
        label: 'Team Members',
        fields: nestedFields,
        addButtonLabel: 'Add Member',
        deleteButtonLabel: 'Remove',
    },
};

export const WithTextarea: Story = {
    render: (args) => {
        const [value, setValue] = useState([]);

        return (
            <NestedComponent
                {...args}
                
                value={value}
                onChange={setValue}
            />
        );
    },
    args: {
        id: 'textarea-nested',
        label: 'Notes',
        fields: [
            {
        key: 'name',
        type: 'text',
        label: 'Name',
        placeholder: 'Enter name',
    },
    {
        key: 'email',
        type: 'text',
        label: 'Email',
        placeholder: 'Enter email',
    },
            {
                key: 'note',
                type: 'textarea',
                label: 'Note',
                placeholder: 'Enter note',
            },
        ],
        addButtonLabel: 'Add Note',
    },
};
