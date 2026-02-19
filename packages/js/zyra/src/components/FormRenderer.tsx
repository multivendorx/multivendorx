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
        icon: 'user',
        blocks: [
            { id: 'text', icon: 't-letter-bold', type: 'text', label: 'Textbox', placeholder: 'Enter your text here' },
            { id: 'email', icon: 'unread', value: 'email', label: 'Email', placeholder: 'Enter your email here' },
            { id: 'textarea', icon: 'text', value: 'textarea', label: 'Enter your text', placeholder: 'Enter your message here' },
            { id: 'datepicker', icon: 'calendar', value: 'datepicker', label: 'Date Picker', placeholder: 'Select a date' },
            { id: 'timepicker', icon: 'alarm ', value: 'TimePicker', label: 'Time Picker', placeholder: 'Select a time' },
            { id: 'checkboxes', icon: 'checkbox', value: 'checkboxes', label: 'Nature Of Business', options: OPTION_PRESETS },
            { id: 'multi-select', icon: 'multi-select', value: 'multi-select', label: 'Multi Select', options: OPTION_PRESETS },
            { id: 'radio', icon: 'radio icon-form-radio', value: 'radio', label: 'Radio', options: OPTION_PRESETS },
            { id: 'dropdown', icon: 'dropdown-checklist', value: 'dropdown', label: 'Dropdown', options: OPTION_PRESETS },
            { id: 'address', icon: 'form-address ', value: 'address', label: 'Address' },
            { id: 'attachment', icon: 'submission-message ', value: 'attachment', label: 'Attachment' },
            { id: 'richtext', icon: 'text ', value: 'richtext', label: 'Rich Text Block' },
            { id: 'heading', icon: 'form-textarea', value: 'heading', label: 'Heading' },
            { id: 'image', icon: 'image', value: 'image', label: 'Image' },
            { id: 'button', icon: 'button', value: 'button', label: 'Button', placeholder: 'Click me' },
            { id: 'divider', icon: 'divider', value: 'divider', label: 'Divider' },
            { id: 'columns', icon: 'blocks', value: 'columns', label: 'Columns' },
            { id: 'section', icon: 'form-section', value: 'section', label: 'Section' },
            { id: 'recaptcha', icon: 'captcha-automatic-code', value: 'recaptcha', label: 'reCaptcha v3' },
        ]
    },
    {
        id: 'store',
        label: 'Store Fields',
        icon: 'store',
        blocks: [
            { id: 'store-name', icon: 't-letter-bold', value: 'text', label: 'Store Name', fixedName: 'name', placeholder: 'Enter your store name' },
            { id: 'store-description', icon: 'text ', value: 'textarea', label: 'Store Desc', fixedName: 'description', placeholder: 'Enter your store description' },
            { id: 'store-phone', icon: 'form-phone', value: 'text', label: 'Store Phone', fixedName: 'phone', placeholder: 'Enter your store phone' },
            { id: 'store-paypal', icon: 'unread ', value: 'email', label: 'Store Paypal Email', fixedName: 'paypal_email', placeholder: 'Enter your PayPal email' },
            { id: 'store-address', icon: 'form-address ', value: 'address', label: 'Store Address', fixedName: 'address' },
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