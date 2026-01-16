import React, { useEffect, useRef, useState } from 'react';
import FormCustomizer from '../src/components/NotifimaFormCustomizer';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof FormCustomizer> = {
    title: 'Zyra/Components/Notifima/FormCustomizer',
    component: FormCustomizer,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FormCustomizer>;

const StatefulWrapper = (props: any) => {
    const [setting, setSetting] = useState(props.setting);

    return (
        <FormCustomizer
            {...props}
            setting={setting}
            onChange={(key, value, isRestoreDefaults) => {
                console.log('onChange:', key, value, isRestoreDefaults);

                if (key === 'customize_btn' && typeof value === 'object') {
                    setSetting((prev: any) => ({
                        ...prev,
                        customize_btn: value,
                    }));
                } else {
                    setSetting((prev: any) => ({
                        ...prev,
                        [key]: value,
                    }));
                }
            }}
        />
    );
};

export const Default: Story = {
    render: () => (
        <StatefulWrapper
            buttonText="Submit"
            setting={{
                alert_text: 'Subscribe to our newsletter',
                email_placeholder_text: 'Enter your email',
                customize_btn: {
                    text: 'Submit',
                },
            }}
        />
    ),
};

export const EmptyFormCustomizer: Story = {
    args: {
        value: 'default value',
        buttonText: 'Submit',
        setting: {
            field1: 'value1',
            field2: true,
        },
        proSetting: {
            enabled: true,
            tier: 'pro',
        },
        onChange: (key, value, isRestoreDefaults) => {
            console.log(
                `Changed ${key} to`,
                value,
                'Restore defaults:',
                isRestoreDefaults
            );
        },
    },
    render: (args) => {
        return <FormCustomizer {...args} />;
    },
};
