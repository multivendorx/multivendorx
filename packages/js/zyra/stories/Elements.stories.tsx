import Elements from '../src/components/Elements';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Elements> = {
    title: 'Zyra/Components/Form/Elements',
    component: Elements,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Elements>;

const selectOptions = [
    {
        icon: 'adminlib-t-letter-bold icon-form-textbox',
        value: 'text',
        label: 'Textbox',
    },
    { icon: 'adminlib-unread icon-form-email', value: 'email', label: 'Email' },
    {
        icon: 'adminlib-text icon-form-textarea',
        value: 'textarea',
        label: 'Textarea',
    },
    {
        icon: 'adminlib-checkbox icon-form-checkboxes',
        value: 'checkboxes',
        label: 'Checkboxes',
    },
    {
        icon: 'adminlib-multi-select icon-form-multi-select',
        value: 'multiselect',
        label: 'Multi Select',
    },
    { icon: 'adminlib-radio icon-form-radio', value: 'radio', label: 'Radio' },
    {
        icon: 'adminlib-dropdown-checklist icon-form-dropdown',
        value: 'dropdown',
        label: 'Dropdown',
    },
    {
        icon: 'adminlib-captcha-automatic-code icon-form-recaptcha',
        value: 'recaptcha',
        label: 'reCaptcha v3',
    },
    {
        icon: 'adminlib-submission-message icon-form-attachment',
        value: 'attachment',
        label: 'Attachment',
    },
    {
        icon: 'adminlib-form-section icon-form-section',
        value: 'section',
        label: 'Section',
    },
    {
        icon: 'adminlib-calendar icon-form-store-description',
        value: 'datepicker',
        label: 'Date Picker',
    },
    {
        icon: 'adminlib-alarm icon-form-address',
        value: 'TimePicker',
        label: 'Time Picker',
    },
    {
        icon: 'adminlib-divider icon-form-address',
        value: 'divider',
        label: 'Divider',
    },
];

export const TestElements: Story = {
    args: {
        selectOptions,
        onClick: (value) => {
            console.log('Selected:', value);
        },
    },
    render: (args) => {
        return <Elements {...args} />;
    },
};
