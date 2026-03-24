import { useState } from "react";
import { ButtonInputUI } from "../src/components/ButtonInput";
import { StoryObj, Meta } from "@storybook/react-vite";

import '../src/styles/fonts.scss';
import '../src/styles/web/UI/ItemList.scss';
import '../src/styles/common.scss';

const meta: Meta<typeof ButtonInputUI> = {
    title: 'Zyra/Components/ButtonInput',
    component: ButtonInputUI,
    tags: ['autodocs'],
}

export default meta;

type Story = StoryObj<typeof ButtonInputUI>;

// VIEW-BUTTON
export const ViewButton: Story = {
    render: () => {
        return <ButtonInputUI
            buttons={[
                {
                    icon: 'eye',
                    text: 'View All',
                    color: 'purple',
                    onClick: () => {
                        window.open(
                            '?page=multivendorx#&tab=modules'
                        );
                    },
                },
            ]}
            position='left'
        />
    }
};

// SEND-BUTTON
export const SendButton: Story = {
    render: () => {
        return <ButtonInputUI
            buttons={{
                icon: 'send',
                color: 'blue',
                text: 'Generate with AI',
                onClick: () => { },
            }}
            position="left"
        />
    }
};

// MULTIPLE-BUTTON
export const MultipleButton: Story = {
    render: () => {
        const [saving, setSaving] = useState<boolean>(false);

        return (
            <ButtonInputUI
                position="left"
                buttons={[
                    {
                        icon: 'close',
                        text: 'Cancel',
                        color: 'red',
                        onClick: () => { },
                    },
                    {
                        icon: 'save',
                        text: saving ? 'Saving...' : 'Save Answer',
                        color: 'green',
                        disabled: saving,
                        onClick: () => { },
                    },
                ]}
            />
        )
    }
}

// BUTTON-IN-LEFT
export const ButtonsInLeft: Story = {
    render: () => {
        const [saving, setSaving] = useState<boolean>(false);

        return (
            <ButtonInputUI
                position="left"
                buttons={[
                    {
                        icon: 'close',
                        text: 'Cancel',
                        color: 'red',
                        onClick: () => { },
                    },
                    {
                        icon: 'save',
                        text: saving ? 'Saving...' : 'Save Answer',
                        color: 'green',
                        disabled: saving,
                        onClick: () => { },
                    },
                ]}
            />
        )
    }
}

// BUTTONS-IN-RIGHT
export const ButtonsInRight: Story = {
    render: () => {
        const [saving, setSaving] = useState<boolean>(false);

        return (
            <ButtonInputUI
                position="right"
                buttons={[
                    {
                        icon: 'close',
                        text: 'Cancel',
                        color: 'red',
                        onClick: () => { },
                    },
                    {
                        icon: 'save',
                        text: saving ? 'Saving...' : 'Save Answer',
                        color: 'green',
                        disabled: saving,
                        onClick: () => { },
                    },
                ]}
            />
        )
    }
}

// BUTTONS-IN-CENTER
export const ButtonsInCenter: Story = {
    render: () => {
        const [saving, setSaving] = useState<boolean>(false);

        return (
            <ButtonInputUI
                position="center"
                buttons={[
                    {
                        icon: 'close',
                        text: 'Cancel',
                        color: 'red',
                        onClick: () => { },
                    },
                    {
                        icon: 'save',
                        text: saving ? 'Saving...' : 'Save Answer',
                        color: 'green',
                        disabled: saving,
                        onClick: () => { },
                    },
                ]}
            />
        )
    }
}

// DISABLED-BUTTON
export const DisabledButton: Story = {
    render: () => {
        return <ButtonInputUI
            buttons={[
                {
                    icon: 'eye',
                    text: 'View All',
                    color: 'purple',
                    onClick: () => {
                        window.open(
                            '?page=multivendorx#&tab=modules'
                        );
                    },
                    disabled: true
                },
            ]}
            position='left'
        />
    }
};

// WITH-BLOCKSTYLE-AND-CUSTOMSTYLE
export const WithBlockStyleAndCustomStyle: Story = {
    render: () => {
        return <ButtonInputUI
            buttons={{
                icon: 'send',
                text: 'Styled Button',
                color: 'purple-bg',
                onClick: () => alert('Styled Button clicked'),
                style: {
                    backgroundColor: '#6b46c1',
                    color: '#ffffff',
                    borderColor: '#4c1d95',
                    borderRadius: 10,
                    fontSize: 16,
                    fontWeight: "600",
                    borderWidth: 2,
                    paddingTop: 10,
                    paddingRight: 18,
                    paddingBottom: 10,
                    paddingLeft: 18,
                    marginTop: 8,
                    marginRight: 12,
                    marginBottom: 8,
                    marginLeft: 0,
                },
                customStyle: {
                    button_border_size: 2,
                    button_border_color: '#4c1d95',
                    button_background_color: '#7c3aed',
                    button_text_color: '#ffffff',
                    button_border_radious: 12,
                    button_font_size: 16,
                    button_font_width: 700,
                    button_margin_top: 8,
                    button_margin_right: 12,
                    button_margin_bottom: 8,
                    button_margin_left: 0,
                    button_padding_top: 12,
                    button_padding_right: 20,
                    button_padding_bottom: 12,
                    button_padding_left: 20,
                    button_border_color_onhover: '#2e1065',
                    button_text_color_onhover: '#ffffff',
                    button_background_color_onhover: '#5b21b6',
                    button_text: 'Custom Styled CTA',
                },
            }}
            position="left"
            wrapperClass='storybook-buttons-wrapper'
        />
    }
};

// WITH-CHILDREN prop passed
export const WithChildren: Story = {
    render: () => {
        return <ButtonInputUI
            buttons={{
                icon: 'send',
                text: 'This text will not show because children is passed',
                color: 'purple-bg',
                onClick: () => alert('Children Button clicked'),
                customStyle: {
                    button_border_size: 1,
                    button_border_color: '#d1d5db',
                    button_background_color: '#f9fafb',
                    button_text_color: '#111827',
                    button_border_radious: 10,
                    button_font_size: 15,
                    button_font_width: 500,
                    button_margin_top: 10,
                    button_margin_right: 0,
                    button_margin_bottom: 10,
                    button_margin_left: 0,
                    button_padding_top: 12,
                    button_padding_right: 18,
                    button_padding_bottom: 12,
                    button_padding_left: 18,
                    button_border_color_onhover: '#9ca3af',
                    button_text_color_onhover: '#111827',
                    button_background_color_onhover: '#f3f4f6',
                    button_text: 'Ignored because children exists',
                },
                children: (
                    <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                        <strong>Custom Child Content</strong>
                        <span>🚀</span>
                    </span>
                ),
            }}
            position="left"
            wrapperClass='storybook-buttons-wrapper'

        />
    }
};