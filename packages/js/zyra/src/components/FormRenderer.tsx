// External Dependencies
import React from 'react';

// Internal Dependencies
import CanvasEditor from './CanvasEditor/CanvasEditor';
import { FieldComponent } from './types';
import '../styles/web/RegistrationForm.scss';

const OPTION_PRESETS = [
            { id: '1', label: 'Manufacture', value: 'manufacture' },
            { id: '2', label: 'Trader', value: 'trader' },
            { id: '3', label: 'Authorized Agent', value: 'authorized_agent' },
];

// BLOCK GROUPS - WITH PLACEHOLDERS
const BLOCK_GROUPS = [
    {
        id: 'registration',
        label: 'Registration Fields',
        icon: 'adminfont-user',
        blocks: [
            { id: 'text', icon: 'adminfont-t-letter-bold icon-form-textbox', value: 'text', label: 'Textbox', placeholder: 'Enter your text here' },
            { id: 'email', icon: 'adminfont-unread icon-form-email', value: 'email', label: 'Email', placeholder: 'Enter your email here' },
            { id: 'textarea', icon: 'adminfont-text icon-form-textarea', value: 'textarea', label: 'Textarea', placeholder: 'Enter your message here' },
            { id: 'datepicker', icon: 'adminfont-calendar icon-form-store-description', value: 'datepicker', label: 'Date Picker', placeholder: 'Select a date' },
            { id: 'timepicker', icon: 'adminfont-alarm icon-form-address', value: 'TimePicker', label: 'Time Picker', placeholder: 'Select a time' },
            { id: 'checkboxes', icon: 'adminfont-checkbox icon-form-checkboxes', value: 'checkboxes', label: 'Checkboxes', options: OPTION_PRESETS },
            { id: 'multi-select', icon: 'adminfont-multi-select icon-form-multi-select', value: 'multi-select', label: 'Multi Select', options: OPTION_PRESETS },
            { id: 'radio', icon: 'adminfont-radio icon-form-radio', value: 'radio', label: 'Radio', options: OPTION_PRESETS },
            { id: 'dropdown', icon: 'adminfont-dropdown-checklist icon-form-dropdown', value: 'dropdown', label: 'Dropdown', options: OPTION_PRESETS },
            { id: 'address', icon: 'adminfont-form-address icon-form-address', value: 'address', label: 'Address' },
            { id: 'attachment', icon: 'adminfont-submission-message icon-form-attachment', value: 'attachment', label: 'Attachment' },
            { id: 'richtext', icon: 'adminfont-text icon-form-textarea', value: 'richtext', label: 'Rich Text Block' },
            { id: 'heading', icon: 'adminfont-form-textarea', value: 'heading', label: 'Heading' },
            { id: 'image', icon: 'adminfont-image', value: 'image', label: 'Image' },
            { id: 'button', icon: 'adminfont-button', value: 'button', label: 'Button', placeholder: 'Click me' },
            { id: 'divider', icon: 'adminfont-divider', value: 'divider', label: 'Divider' },
            { id: 'columns', icon: 'adminfont-blocks', value: 'columns', label: 'Columns' },
            { id: 'section', icon: 'adminfont-form-section icon-form-section', value: 'section', label: 'Section' },
            { id: 'recaptcha', icon: 'adminfont-captcha-automatic-code icon-form-recaptcha', value: 'recaptcha', label: 'reCaptcha v3' },
        ]
    },
    {
        id: 'store',
        label: 'Store Fields',
        icon: 'adminfont-store',
        blocks: [
            { id: 'store-name', icon: 'adminfont-t-letter-bold icon-form-textbox', value: 'text', label: 'Store Name', fixedName: 'name', placeholder: 'Enter your store name' },
            { id: 'store-description', icon: 'adminfont-text icon-form-textarea', value: 'textarea', label: 'Store Desc', fixedName: 'description', placeholder: 'Enter your store description' },
            { id: 'store-phone', icon: 'adminfont-form-phone icon-form-textbox', value: 'text', label: 'Store Phone', fixedName: 'phone', placeholder: 'Enter your store phone' },
            { id: 'store-paypal', icon: 'adminfont-unread icon-form-email', value: 'email', label: 'Store Paypal Email', fixedName: 'paypal_email', placeholder: 'Enter your PayPal email' },
            { id: 'store-address', icon: 'adminfont-form-address icon-form-address', value: 'address', label: 'Store Address', fixedName: 'address' },
        ]
    }
];

// MAIN COMPONENT
export const RegistrationFormUI: React.FC<any> = ({
    value,
    onChange,
    proSettingChange = () => false,
    field,
    setting = {},
    name = field?.key || 'registration-form',
}) => {
    // Get initial blocks
    const initialBlocks = React.useMemo(() => {
        if (Array.isArray(value?.formfieldlist)) return value.formfieldlist;
        if (Array.isArray(setting[name]?.formfieldlist)) return setting[name].formfieldlist;
        return [];
    }, [value, setting, name]);

    const handleBlocksChange = React.useCallback((blocks: Block[]) => {
        onChange({ formfieldlist: blocks });
    }, [onChange]);

    const visibleGroups = field?.visibleGroups || ['registration'];
    
    return (
        <CanvasEditor
            blocks={initialBlocks}
            onChange={handleBlocksChange}
            blockGroups={BLOCK_GROUPS}
            visibleGroups={visibleGroups}
            groupName="registration"
            proSettingChange={proSettingChange}
            context="registration"
        />
    );
};

const RegistrationForm: FieldComponent = {
    render: RegistrationFormUI,
};

export default RegistrationForm;