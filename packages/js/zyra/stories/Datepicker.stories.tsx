import React, {useState} from 'react';
import Datepicker from '../src/components/DatePicker';
import type { Meta, StoryObj } from '@storybook/react-vite';
import "../src/styles/common.scss";

const meta: Meta<typeof Datepicker> = {
    title: 'Zyra/Components/Form/DatePicker',
    component: Datepicker,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Datepicker>;

export const TestDatepicker: Story = {
    args: {
        formField: {
            label: 'Select Date',
        },
        onChange: (field, value) => {
            console.log(`Changed ${field} to ${value}`);
        },
    },
    render: (args) => {
        return <div className="multivendorx-main-wrapper"><Datepicker {...args} /></div>;
    },
};

export const TestDatepickerwithoutLabel: Story = {
    args: {
        formField: {
            label: ' ',
        },
        onChange: (field, value) => {
            console.log(`Changed ${field} to ${value}`);
        },
    },
    render: (args) => {
        return <div className="multivendorx-main-wrapper"><Datepicker {...args} /></div>;
    },
};
