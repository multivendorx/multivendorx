import { __ } from '@wordpress/i18n';

export default {
    id: 'contact-information',
    priority: 6,
    headerTitle: __('Contact Information', 'multivendorx'),
    headerDescription: __(
        'Add your store’s contact details so customers can reach you easily through phone, email.',
        'multivendorx'
    ),
    headerIcon: 'form-phone',
    modal: [
        //   // Success Notice
        //   {
        //     type: 'notice',
        //     name: 'successNotice',
        //     message: successMsg
        //   },

        {
            type: 'text',
            name: 'phone',
            label: __('Phone', 'multivendorx'),
            key: 'phone',
            cols: 2,
            // value: formData.phone,
            // onChange: (value: string) => handleChange('phone', value),
            // readOnly: settings.includes('store_contact')
        },

        // Email / Additional Email
        {
            type: 'text',
            name: 'email',
            label: __('Email / Additional Email', 'multivendorx'),
            key: 'email',
            cols: 2,
            inputType: 'email',
            // value: formData.email,
            // onChange: (value: string) => handleChange('phone', value), // Note: This currently updates 'phone' - might need to be fixed
            // readOnly: settings.includes('store_contact')
        },

        // Live Chat (conditional)
        {
            type: 'text',
            name: 'live_chat',
            label: __('Live Chat (Enable, WhatsApp, etc.)', 'multivendorx'),
            key: 'live_chat',
            // condition: modules.includes('live-chat'),
            // value: formData.live_chat,
            // onChange: (value: string) => handleChange('live_chat', value)
        }
    ],
};