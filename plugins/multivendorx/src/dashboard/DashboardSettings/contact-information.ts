import { __ } from '@wordpress/i18n';

const settings =
		appLocalizer.settings_databases_value['store-permissions']
			?.edit_store_info_activation || [];

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
            label: __('Phone', 'multivendorx'),
            key: 'phone',
            readOnly: !settings.includes('store_contact')
        },

        // Email / Additional Email
        {
            type: 'email',
            label: __('Email / Additional Email', 'multivendorx'),
            key: 'email',
            readOnly: !settings.includes('store_contact')
        },

        // Live Chat (conditional)
        {
            type: 'text',
            label: __('Live Chat (Enable, WhatsApp, etc.)', 'multivendorx'),
            key: 'live_chat',
            moduleEnabled: 'live-chat',
        }
    ],
};