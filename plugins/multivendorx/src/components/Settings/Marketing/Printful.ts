import { __ } from '@wordpress/i18n';

export default {
    id: 'printful',
    priority: 7,
    headerTitle: __('Printful', 'multivendorx'),
    settingTitle: 'Printful settings',
    headerDescription: __(
        'Set purchase limits for individual products to prevent bulk buying or ensure minimum order quantities.',
        'multivendorx'
    ),
    headerIcon: 'printful',
    submitUrl: 'settings',
    modal: [
        {
            key: 'client-id',
            type: 'text',
            label: __('Client ID','multivendorx'),
        },
        {
            key: 'secret-key',
            type: 'text',
            label: __('Secret Key','multivendorx'),
        }
    ],
};
