// CommonPopup.stories.tsx
import React, { useState } from 'react';
import CommonPopup from '../src/components/CommonPopup';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@mui/material';

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
                <Button variant="contained" onClick={() => setOpen(true)}>
                    Open Popup
                </Button>

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
                <Button variant="contained" onClick={() => setOpen(true)}>
                    Open Popup with Header
                </Button>

                <CommonPopup
                    open={open}
                    onClose={() => setOpen(false)}
                    header={<h3 style={{ margin: 0 }}>Popup Header</h3>}
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
                <Button variant="contained" onClick={() => setOpen(true)}>
                    Open Popup with Footer
                </Button>

                <CommonPopup
                    open={open}
                    onClose={() => setOpen(false)}
                    header={{title: "Popup Header"}}
                    footer={
                        <>
                            <Button
                                variant="outlined"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => alert('Action executed!')}
                            >
                                Save
                            </Button>
                        </>
                    }
                    width={400}
                >
                    <p>This popup includes a custom footer.</p>
                    <p>You can include buttons or actions here.</p>
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
                <Button variant="contained" onClick={() => setOpen(true)}>
                    Open Popup with Custom Size
                </Button>

                <CommonPopup
                    open={open}
                    onClose={() => setOpen(false)}
                    header={<h3>Popup Header</h3>}
                    width={600}
                    height={300}
                >
                    <p>This popup has custom width and height.</p>
                    <p>You can adjust the size via props.</p>
                </CommonPopup>
            </>
        );
    },
};
