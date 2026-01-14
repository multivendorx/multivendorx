// EmailsInput.stories.tsx
import React, { useState } from 'react';
import EmailsInput, { EmailsInputProps } from '../src/components/EmailsInput';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof EmailsInput> = {
    title: 'Zyra/Components/EmailsInput',
    component: EmailsInput,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof EmailsInput>;

export const Default: Story = {
    args: {
        mode: 'multiple',
        placeholder: 'Enter emails...',
        enablePrimary: true,
    },
    render: (args) => {
        const [emails, setEmails] = useState<string[]>([]);
        const [primary, setPrimary] = useState<string | null>(null);

        return (
            <div style={{ width: '400px' }}>
                <EmailsInput
                    {...args}
                    value={emails}
                    primary={primary}
                    onChange={(updated, newPrimary) => {
                        console.log('Emails:', updated, 'Primary:', newPrimary);
                        setEmails(updated);
                        setPrimary(newPrimary);
                    }}
                />
            </div>
        );
    },
};

export const SingleMode: Story = {
    args: {
        mode: 'single',
        placeholder: 'Enter a single email',
    },
    render: (args) => {
        const [emails, setEmails] = useState<string[]>([]);
        return (
            <EmailsInput
                {...args}
                value={emails}
                onChange={(updated) => {
                    console.log('Single mode email:', updated);
                    setEmails(updated);
                }}
            />
        );
    },
};

export const WithMaxLimit: Story = {
    args: {
        mode: 'multiple',
        max: 3,
        placeholder: 'Add up to 3 emails',
    },
    render: (args) => {
        const [emails, setEmails] = useState<string[]>([]);
        return (
            <EmailsInput
                {...args}
                value={emails}
                onChange={(updated) => {
                    console.log('Emails with max limit:', updated);
                    setEmails(updated);
                }}
            />
        );
    },
};

export const PrefilledWithPrimary: Story = {
    args: {
        mode: 'multiple',
        enablePrimary: true,
        placeholder: 'Enter emails...',
    },
    render: (args) => {
        const [emails, setEmails] = useState<string[]>([
            'john@example.com',
            'jane@example.com',
            'admin@example.com',
        ]);
        const [primary, setPrimary] = useState<string | null>(
            'jane@example.com'
        );

        return (
            <div style={{ width: '400px' }}>
                <EmailsInput
                    {...args}
                    value={emails}
                    primary={primary}
                    onChange={(updated, newPrimary) => {
                        console.log('Emails:', updated, 'Primary:', newPrimary);
                        setEmails(updated);
                        setPrimary(newPrimary);
                    }}
                />
            </div>
        );
    },
};

export const PrimaryDisabled: Story = {
    args: {
        mode: 'multiple',
        enablePrimary: false,
        placeholder: 'Enter emails (no primary)',
    },
    render: (args) => {
        const [emails, setEmails] = useState<string[]>([
            'user1@example.com',
            'user2@example.com',
        ]);

        return (
            <div style={{ width: '400px' }}>
                <EmailsInput
                    {...args}
                    value={emails}
                    onChange={(updated, newPrimary) => {
                        console.log('Emails:', updated, 'Primary:', newPrimary);
                        setEmails(updated);
                    }}
                />
            </div>
        );
    },
};

