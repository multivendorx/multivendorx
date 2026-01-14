// CommonPopup.stories.tsx
import React, { useState } from 'react';
import CommonPopup from '../src/components/CommonPopup';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@mui/material';
import AdminButton from '../src/components/UI/AdminButton';

const meta: Meta<typeof CommonPopup> = {
    title: 'Zyra/Components/CommonPopup',
    component: CommonPopup,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof CommonPopup>;

export const Default: Story = {
    render: () => {
        const [open, setOpen] = useState(true);

        return (
            <>
                <AdminButton
                    wrapperClass='left'
                    buttons={{
                        text: 'Open Default Popup',
                        onClick: () => setOpen(true),
                        className: 'btn btn-primary',
                    }}
                />

                <CommonPopup open={open} onClose={() => setOpen(false)}>
                    <p>This is the default popup content.</p>
                    <p>You can add any React node here.</p>
                </CommonPopup>
            </>
        );
    },
};

export const WithHeader: Story = {
    render: () => {
        const [open, setOpen] = useState(true);

        return (
            <>
                <AdminButton
                    wrapperClass='left'
                    buttons={{
                        text: 'Open Header Popup',
                        onClick: () => setOpen(true),
                        className: 'btn btn-primary',
                    }}
                />

                <CommonPopup
                    open={open}
                    onClose={() => setOpen(false)}
                    header={{
                        title: "Popup Header",
                        description: "This is a description for the popup header.",
                    }}
                >
                    <p>This popup has a custom header.</p>
                    <p>You can include titles, icons, or other elements.</p>
                </CommonPopup>
            </>
        );
    },
};

export const WithHeaderWithoutDesc: Story = {
    render: () => {
        const [open, setOpen] = useState(true);

        return (
            <>
                <AdminButton
                    wrapperClass='left'
                    buttons={{
                        text: 'Open Header Popup',
                        onClick: () => setOpen(true),
                        className: 'btn btn-primary',
                    }}
                />

                <CommonPopup
                    open={open}
                    onClose={() => setOpen(false)}
                    header={{
                        title: "Popup Header",
                        }}
                >
                    <p>This popup has a custom header.</p>
                    <p>You can include titles, icons, or other elements.</p>
                </CommonPopup>
            </>
        );
    },
};

export const WithFooter: Story = {
    render: () => {
        const [open, setOpen] = useState(true);

        return (
            <>
                <AdminButton 
                    wrapperClass='left' 
                    buttons={{
                        text: 'Open Popup with Footer',
                        onClick: () => setOpen(true)
                        
                    }}
                   
                />

                <CommonPopup
                    open={open}
                    width="31.25rem"
                    height="50%"
                    onClose={() => setOpen(false)}
                    footer={
                        <AdminButton
						buttons={[
							{
								icon: 'close',
								text:'Cancel',
								className: 'red',
								onClick: () => setOpen(false),
							},
							{
								icon: 'save',
								text: 'Save',
								className: 'purple-bg',
								onClick: () => alert('Save action executed!'),
							},
						]}
					    />
                    }
                >
                    <p>This popup includes a custom footer.</p>
                    <p>You can include buttons or actions here.</p>
                </CommonPopup>
            </>
        );
    },
};

export const WithHeaderAndFooter: Story = {
    render: () => {
        const [open, setOpen] = useState(true);

        return (
            <>
                <AdminButton 
                    wrapperClass='left'
                    buttons={{
                        text: 'Open Popup with Header and Footer',
                        onClick: () => setOpen(true)
                    }}
                   
                />

                <CommonPopup
                    open={open}
                    onClose={() => setOpen(false)}
                    width="31.25rem"
                    height="50%"
                    header={{
                        title: "Popup Header",

                    }}
                    footer={
                        <AdminButton
						buttons={[
							{
								icon: 'close',
								text:'Cancel',
								className: 'red',
								onClick: () => setOpen(false),
							},
							{
								icon: 'save',
								text: 'Save',
								className: 'purple-bg',
								onClick: () => alert('Save action executed!'),
							},
						]}
					    />
                    }
                >
                    <p>This popup has both a header and a footer.</p>
                    <p>You can include titles, buttons, or other elements.</p>
                </CommonPopup>
            </>
        );
    },
};

export const CustomSize: Story = {
    render: () => {
        const [open, setOpen] = useState(true);

        return (
            <>
                <AdminButton 
                    wrapperClass='left'
                    buttons={{
                        text: 'Open Popup with Custom Size',
                        onClick: () => setOpen(true)
                    }}
                   
                />

                <CommonPopup
                    open={open}
                    onClose={() => setOpen(false)}
                    header={{title: "Popup Header"}}
                    width="50rem"
                    height="80%"
                >
                    <p>This popup has custom width and height.</p>
                    <p>You can adjust the size via props.</p>
                </CommonPopup>
            </>
        );
    },
};