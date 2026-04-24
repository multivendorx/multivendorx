import { __ } from '@wordpress/i18n';

export default {
    id: 'printful',
    priority: 7,
    headerTitle: __('Printful', 'multivendorx'),
    settingTitle: 'Printful settings',
    headerDescription: __(
        'Configure your Printful integration by entering your Client ID and Secret Key to connect your store.',
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
