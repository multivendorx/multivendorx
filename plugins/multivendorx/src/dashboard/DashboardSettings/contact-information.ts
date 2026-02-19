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
    submitUrl: `store/${appLocalizer.store_id}`,
    modal: [
        {
            type: 'number',
            name: 'phone',
            label: __('Phone', 'multivendorx'),
            key: 'phone',
            readOnly: true,
        },

        // Email / Additional Email
        {
            type: 'email',
            name: 'email',
            label: __('Email / Additional Email', 'multivendorx'),
            key: 'email',
            inputType: 'email',
            readOnly: true,
        },

        // Live Chat (conditional)
        {
            type: 'text',
            name: 'live_chat',
            label: __('Live Chat (Enable, WhatsApp, etc.)', 'multivendorx'),
            key: 'live_chat',
        }
    ],
};