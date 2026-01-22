/**
 * External dependencies
 */
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Internal dependencies
 */
import TimePicker from '../src/components/TimePicker';

const meta: Meta<typeof TimePicker> = {
    title: 'Zyra/Components/TimePicker',
    component: TimePicker,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TimePicker>;

/**
 * Basic TimePicker with controlled label
 */
export const Basic: Story = {
    render: () => {
        const [formField, setFormField] = useState({
            label: 'Select Time',
        });

        const handleChange = (field: string, value: string) => {
            console.log('Changed:', field, value);
            setFormField((prev) => ({
                ...prev,
                [field]: value,
            }));
        };

        return (
            <TimePicker
                formField={formField}
                onChange={handleChange}
            />
        );
    },
};

export const EmptyLabel: Story = {
    render: () => {
        const [formField, setFormField] = useState({
            label: '',
        });

        return (
            <TimePicker
                formField={formField}
                onChange={(field, value) =>
                    setFormField({ ...formField, [field]: value })
                }
            />
        );
    },
};

