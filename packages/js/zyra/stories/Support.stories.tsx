import React from 'react';
import Support from '../src/components/Support';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Support> = {
    title: 'Zyra/Components/Support',
    component: Support,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Support>;

export const TestSupport: Story = {
    args: {
        url: 'https://support.example.com', // URL for embedded support video
        title: 'Help & Support', // Main heading for support section
        subTitle: 'Find answers to common questions below.', // Subtitle for support section
        faqData: [
            {
                question: 'How do I reset my password?',
                answer: "Click on 'Forgot password' at the login screen and follow the instructions.",
                open: false,
            },
            {
                question: 'Where can I access my account settings?',
                answer: 'Go to the dashboard and click on your profile icon to access settings.',
                open: false,
            },
        ],
    },
    render: (args) => <Support {...args} />,
};

export const SingleFAQ: Story = {
    args: {
        url: 'https://support.example.com',
        title: 'Help & Support',
        subTitle: 'Frequently asked questions',
        faqData: [
            {
                question: 'How do I contact support?',
                answer: 'You can contact support via the help desk or email.',
                open: false,
            },
        ],
    },
};

export const FAQOpenByDefault: Story = {
    args: {
        url: 'https://support.example.com',
        title: 'Help & Support',
        subTitle: 'Common questions answered',
        faqData: [
            {
                question: 'How do I reset my password?',
                answer:
                    "Click on <strong>Forgot password</strong> on the login page and follow the instructions.",
                open: true, // opened by default
            },
            {
                question: 'Where can I manage my account?',
                answer:
                    'Go to your dashboard and open the account settings section.',
                open: false,
            },
        ],
    },
};

export const CustomHeaderContent: Story = {
    args: {
        url: 'https://support.example.com',
        title: 'Welcome to MultivendorX Support',
        subTitle:
            'Explore tutorials, FAQs, and videos to get the most out of your plugin.',
        faqData: [
            {
                question: 'Is MultivendorX beginner friendly?',
                answer:
                    'Yes! Our documentation and setup wizard make it easy to get started.',
                open: false,
            },
            {
                question: 'Do you provide premium support?',
                answer:
                    'Premium users get priority email and ticket-based support.',
                open: false,
            },
        ],
    },
};

export const ManyFAQs: Story = {
    args: {
        url: 'https://support.example.com',
        title: 'Help & Support',
        subTitle: 'Find answers to all common questions',
        faqData: [
            {
                question: 'How do I install the plugin?',
                answer: 'Upload the plugin ZIP and activate it from WordPress.',
                open: false,
            },
            {
                question: 'Does it work with WooCommerce?',
                answer: 'Yes, WooCommerce is required for this plugin.',
                open: false,
            },
            {
                question: 'Can I customize vendor dashboards?',
                answer: 'Yes, dashboard customization is fully supported.',
                open: false,
            },
            {
                question: 'Is there a setup wizard?',
                answer: 'Yes, a guided setup wizard runs on first install.',
                open: false,
            },
            {
                question: 'Where can I find documentation?',
                answer:
                    'Visit our official documentation site for guides and tutorials.',
                open: false,
            },
            {
                question: 'How do I contact support?',
                answer:
                    'You can submit a ticket via the support portal.',
                open: false,
            },
        ],
    },
};
