// AdminHeader.stories.tsx
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import AdminHeader from '../src/components/AdminHeader';

const meta: Meta<typeof AdminHeader> = {
    title: 'Zyra/Components/AdminHeader',
    component: AdminHeader,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AdminHeader>;

// Sample dropdown options
const dropdownOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
];

// Sample search results
const searchResults = [
    { icon: 'adminlib-user', name: 'John Doe', desc: 'Admin User', link: '#' },
    { icon: 'adminlib-settings', name: 'Settings Panel', desc: 'Manage settings', link: '#' },
];

// Sample messages
const messages = [
    {
        heading: 'New message',
        message: 'You have a new message from Admin',
        time: '5 min ago',
        icon: 'adminlib-user-network-icon',
        color: 'green',
        link: '#',
    },
    {
        heading: 'System Alert',
        message: 'Server will be down for maintenance',
        time: '1 hr ago',
        icon: 'adminlib-alert-icon',
        color: 'red',
        link: '#',
    },
];

// Sample profile items
const profileItems = [
    { title: 'My Profile', icon: 'adminlib-user-circle', link: '#' },
    { title: 'Settings', icon: 'adminlib-settings', link: '#' },
    { title: 'Logout', icon: 'adminlib-logout', action: () => alert('Logged out') },
];

export const DefaultHeader: Story = {
    render: () => {
        const [query, setQuery] = useState('');
        const [selectValue, setSelectValue] = useState('option1');

        return (
            <AdminHeader
                brandImg="https://via.placeholder.com/150x50?text=Logo"
                query={query}
                results={searchResults}
                onSearchChange={(v) => setQuery(v)}
                onResultClick={(res) => alert(`Clicked: ${res.name}`)}
                showDropdown={true}
                dropdownOptions={dropdownOptions}
                selectValue={selectValue}
                onSelectChange={(v) => setSelectValue(v)}
                free="1.0.0"
                pro="2.0.0"
                showNotifications
                showMessages
                showActivities
                messages={messages}
                messagesLink="#"
                showProfile
                profileItems={profileItems}
                chatUrl="https://example.com/chat"
            />
        );
    },
};

export const HeaderWithoutDropdown: Story = {
    render: () => (
        <AdminHeader
            brandImg="https://via.placeholder.com/150x50?text=Logo"
            query=""
            onSearchChange={() => {}}
            onResultClick={() => {}}
            selectValue=""
            onSelectChange={() => {}}
            free="1.0.0"
            pro="2.0.0"
            showDropdown={false}
            showNotifications
            showMessages
            messages={messages}
            messagesLink="#"
            showProfile
            profileItems={profileItems}
            chatUrl="https://example.com/chat"
        />
    ),
};

export const HeaderWithEmptyMessages: Story = {
    render: () => (
        <AdminHeader
            brandImg="https://via.placeholder.com/150x50?text=Logo"
            query=""
            results={[]}
            onSearchChange={() => {}}
            onResultClick={() => {}}
            selectValue=""
            onSelectChange={() => {}}
            free="1.0.0"
            pro="2.0.0"
            showNotifications
            showMessages
            messages={[]}
            showProfile
            profileItems={profileItems}
            chatUrl="https://example.com/chat"
        />
    ),
};

export const HeaderWithoutProfile: Story = {
    render: () => 
    (
        <AdminHeader
            brandImg="https://via.placeholder.com/150x50?text=Logo"
            query=""
            results={[]}
            onSearchChange={() => {}}
            onResultClick={() => {}}
            selectValue=""
            onSelectChange={() => {}}
            free="1.0.0"
            pro="2.0.0"
            showDropdown={true}
            dropdownOptions={dropdownOptions}
            showNotifications
            showMessages
            messages={messages}
            messagesLink="#"
            showProfile={false}
            chatUrl="https://example.com/chat"
        />
    ),
};
