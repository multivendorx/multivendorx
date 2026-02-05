

import { BlockConfig, BlockType } from './types';

// EXPORTED BLOCKS

export const STORE_BLOCKS: BlockConfig[] = [
    { id: 'store-name', icon: 'adminfont-t-letter-bold icon-form-textbox', value: 'text', label: 'Store Name', name: 'name', category: 'store' },
    { id: 'store-description', icon: 'adminfont-text icon-form-textarea', value: 'textarea', label: 'Store Desc', name: 'description', category: 'store' },
    { id: 'store-phone', icon: 'adminfont-form-phone icon-form-textbox', value: 'text', label: 'Store Phone', name: 'phone', category: 'store' },
    { id: 'store-paypal', icon: 'adminfont-unread icon-form-email', value: 'email', label: 'Store Paypal Email', name: 'paypal_email', category: 'store' },
    { id: 'store-address', icon: 'adminfont-form-address icon-form-address', value: 'address', label: 'Store Address', name: 'address', category: 'store' },
];

export const EMAIL_BLOCKS: BlockConfig[] = [
    { id: 'heading', icon: 'adminfont-form-textarea', value: 'heading', label: 'Heading', category: 'advanced' },
    { id: 'richtext', icon: 'adminfont-t-letter-bold', value: 'richtext', label: 'Text', category: 'advanced' },
    { id: 'image', icon: 'adminfont-image', value: 'image', label: 'Image', category: 'advanced' },
    { id: 'button', icon: 'adminfont-button', value: 'button', label: 'Button', category: 'advanced' },
    { id: 'divider', icon: 'adminfont-divider', value: 'divider', label: 'Divider', category: 'advanced' },
    { id: 'columns', icon: 'adminfont-blocks', value: 'columns', label: 'Columns', category: 'layout' },
];

export const REGISTRATION_BLOCKS: BlockConfig[] = [
    {
        id: 'text',
        icon: 'adminfont-t-letter-bold icon-form-textbox',
        value: 'text',
        label: 'Textbox',
        category: 'basic'
    },
    {
        id: 'email',
        icon: 'adminfont-unread icon-form-email',
        value: 'email',
        label: 'Email',
        category: 'basic'
    },
    {
        id: 'textarea',
        icon: 'adminfont-text icon-form-textarea',
        value: 'textarea',
        label: 'Textarea',
        category: 'basic'
    },
    {
        id: 'datepicker',
        icon: 'adminfont-calendar icon-form-store-description',
        value: 'datepicker',
        label: 'Date Picker',
        category: 'basic'
    },
    {
        id: 'timepicker',
        icon: 'adminfont-alarm icon-form-address',
        value: 'TimePicker',
        label: 'Time Picker',
        category: 'basic'
    },
    {
        id: 'richtext',
        icon: 'adminfont-text icon-form-textarea',
        value: 'richtext',
        label: 'Rich Text Block',
        category: 'advanced'
    },
    {
        id: 'heading',
        icon: 'adminfont-form-textarea',
        value: 'heading',
        label: 'Heading',
        category: 'advanced'
    },
    {
        id: 'image',
        icon: 'adminfont-image',
        value: 'image',
        label: 'Image',
        category: 'advanced'
    },
    {
        id: 'button',
        icon: 'adminfont-button',
        value: 'button',
        label: 'Button',
        category: 'advanced'
    },
    {
        id: 'divider',
        icon: 'adminfont-divider',
        value: 'divider',
        label: 'Divider',
        category: 'advanced'
    },
    {
        id: 'checkboxes',
        icon: 'adminfont-checkbox icon-form-checkboxes',
        value: 'checkboxes',
        label: 'Checkboxes',
        category: 'basic'
    },
    {
        id: 'multiselect',
        icon: 'adminfont-multi-select icon-form-multi-select',
        value: 'multiselect',
        label: 'Multi Select',
        category: 'basic'
    },
    {
        id: 'radio',
        icon: 'adminfont-radio icon-form-radio',
        value: 'radio',
        label: 'Radio',
        category: 'basic'
    },
    {
        id: 'dropdown',
        icon: 'adminfont-dropdown-checklist icon-form-dropdown',
        value: 'dropdown',
        label: 'Dropdown',
        category: 'basic'
    },
    {
        id: 'columns',
        icon: 'adminfont-blocks',
        value: 'columns',
        label: 'Columns',
        category: 'layout'
    },
    {
        id: 'section',
        icon: 'adminfont-form-section icon-form-section',
        value: 'section',
        label: 'Section',
        category: 'layout'
    },
    {
        id: 'recaptcha',
        icon: 'adminfont-captcha-automatic-code icon-form-recaptcha',
        value: 'recaptcha',
        label: 'reCaptcha v3',
        category: 'advanced'
    },
    {
        id: 'attachment',
        icon: 'adminfont-submission-message icon-form-attachment',
        value: 'attachment',
        label: 'Attachment',
        category: 'advanced'
    },
    {
        id: 'address',
        icon: 'adminfont-form-address icon-form-address',
        value: 'address',
        label: 'Address',
        category: 'advanced'
    },
];

// Helper Functions

export const getBlockConfig = (type: BlockType): BlockConfig | undefined =>
    REGISTRATION_BLOCKS.find(block => block.value === type);

export const getBlocksByCategory = (category: BlockConfig['category']): BlockConfig[] =>
    REGISTRATION_BLOCKS.filter(block => block.category === category);

export const isContentBlock = (type: BlockType): boolean =>
    ['richtext', 'heading', 'image', 'button', 'divider'].includes(type);

export const isFormInputBlock = (type: BlockType): boolean =>
    ['text', 'email', 'number', 'textarea', 'datepicker', 'TimePicker', 'radio', 'dropdown', 'multiselect', 'checkboxes', 'attachment', 'address'].includes(type);

export const supportsOptions = (type: BlockType): boolean =>
    ['radio', 'dropdown', 'multiselect', 'checkboxes'].includes(type);