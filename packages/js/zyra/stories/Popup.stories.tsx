import { StoryObj, Meta } from "@storybook/react-vite";
import { useState } from "react";

import { PopupUI } from "../src/components/Popup";
import { ItemListUI } from "../src/components/ItemList";

const meta: Meta<typeof PopupUI> = {
    title: 'Zyra/Components/Popup',
    component: PopupUI,
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof PopupUI>;

const tableMenuItems = [
    {
        id: 'store',
        title: 'Store',
        tags: <input type="checkbox" checked readOnly />,
    },
    {
        id: 'contact',
        title: 'Contact',
        tags: <input type="checkbox" checked readOnly />,
    },
    {
        id: 'lifetime-earning',
        title: 'Lifetime Earning',
        tags: <input type="checkbox" checked readOnly />,
    },
    {
        id: 'primary-owner',
        title: 'Primary Owner',
        tags: <input type="checkbox" checked readOnly />,
    },
    {
        id: 'status',
        title: 'Status',
        tags: <input type="checkbox" checked readOnly />,
    },
    {
        id: 'action',
        title: 'Action',
        tags: <input type="checkbox" checked readOnly />,
    },
];

export const MenuDropdown: Story = {
    render: () => {
        const [open, setOpen] = useState<boolean | undefined>(true);

        return (
            <PopupUI
                position='menu-dropdown'
                open={open}
                toggleIcon="more-vertical"
                tooltipName="Menu"
                header={undefined}
                footer={undefined}
                width={14}
                height='fit-content'
                className=''
                showBackdrop={true}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
            >
                <ItemListUI className="table-menu default" items={tableMenuItems} />
            </PopupUI>
        )
    }
}

export const ClosedMenuDropdown: Story = {
    render: () => {
        const [open, setOpen] = useState<boolean | undefined>(false);

        return (
            <PopupUI
                position='menu-dropdown'
                open={open}
                toggleIcon="more-vertical"
                tooltipName="Menu"
                header={undefined}
                footer={undefined}
                width={14}
                height='fit-content'
                className=''
                showBackdrop={true}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
            >
                <ItemListUI className="table-menu default" items={tableMenuItems} />
            </PopupUI>
        )
    }
}

export const PopupWithHeaderAndFooter: Story = {
    render: () => {
        const [open, setOpen] = useState<boolean | undefined>(true);

        return (
            <PopupUI
                position='slide-right-to-left'
                open={open}
                toggleIcon="more-vertical"
                tooltipName="Menu"
                header={{
                    icon: 'settings',
                    title: 'Column Preferences',
                    description: 'Choose which columns to display in the table.',
                }}
                footer={
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button>Cancel</button>
                        <button>Apply</button>
                    </div>
                }
                width={20}
                height='fit-content'
                className=''
                showBackdrop={true}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
            >
                <ItemListUI className="table-menu default" items={tableMenuItems} />
            </PopupUI>
        )
    }
}

export const LightBoxPopup: Story = {
    render: () => {
        const [open, setOpen] = useState<boolean | undefined>(true);

        return (
            <PopupUI
                position='lightbox'
                open={open}
                toggleIcon="more-vertical"
                tooltipName="Menu"
                header={{
                    icon: 'settings',
                    title: 'Column Preferences',
                    description: 'Choose which columns to display in the table.',
                }}
                footer={
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button>Cancel</button>
                        <button>Apply</button>
                    </div>
                }
                width={20}
                height='fit-content'
                className=''
                showBackdrop={true}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
            >
                <ItemListUI className="table-menu default" items={tableMenuItems} />
            </PopupUI>
        )
    }
}

export const SlideRighttoLeftPopup: Story = {
    render: () => {
        const [open, setOpen] = useState<boolean | undefined>(true);

        return (
            <PopupUI
                position='slide-right-to-left'
                open={open}
                toggleIcon="more-vertical"
                tooltipName="Menu"
                header={{
                    icon: 'settings',
                    title: 'Column Preferences',
                    description: 'Choose which columns to display in the table.',
                }}
                footer={
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button>Cancel</button>
                        <button>Apply</button>
                    </div>
                }
                width={20}
                height='fit-content'
                className=''
                showBackdrop={true}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
            >
                <ItemListUI className="table-menu default" items={tableMenuItems} />
            </PopupUI>
        )
    }
}

export const SlideLeftToRightPopup: Story = {
    render: () => {
        const [open, setOpen] = useState<boolean | undefined>(true);

        return (
            <PopupUI
                position='slide-left-to-right'
                open={open}
                toggleIcon="more-vertical"
                tooltipName="Menu"
                header={{
                    icon: 'settings',
                    title: 'Column Preferences',
                    description: 'Choose which columns to display in the table.',
                }}
                footer={
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button>Cancel</button>
                        <button>Apply</button>
                    </div>
                }
                width={20}
                height='fit-content'
                className=''
                showBackdrop={true}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
            >
                <ItemListUI className="table-menu default" items={tableMenuItems} />
            </PopupUI>
        )
    }
}

export const SlideTopToBottomPopup: Story = {
    render: () => {
        const [open, setOpen] = useState<boolean | undefined>(true);

        return (
            <PopupUI
                position='slide-top-to-bottom'
                open={open}
                toggleIcon="more-vertical"
                tooltipName="Menu"
                header={{
                    icon: 'settings',
                    title: 'Column Preferences',
                    description: 'Choose which columns to display in the table.',
                }}
                footer={
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button>Cancel</button>
                        <button>Apply</button>
                    </div>
                }
                width={20}
                height='fit-content'
                className=''
                showBackdrop={true}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
            >
                <ItemListUI className="table-menu default" items={tableMenuItems} />
            </PopupUI>
        )
    }
}

export const SlideBottomToTopPopup: Story = {
    render: () => {
        const [open, setOpen] = useState<boolean | undefined>(true);

        return (
            <PopupUI
                position='slide-bottom-to-top'
                open={open}
                toggleIcon="more-vertical"
                tooltipName="Menu"
                header={{
                    icon: 'settings',
                    title: 'Column Preferences',
                    description: 'Choose which columns to display in the table.',
                }}
                footer={
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button>Cancel</button>
                        <button>Apply</button>
                    </div>
                }
                width={20}
                height='fit-content'
                className=''
                showBackdrop={true}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
            >
                <ItemListUI className="table-menu default" items={tableMenuItems} />
            </PopupUI>
        )
    }
}



