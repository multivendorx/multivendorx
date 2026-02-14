import { __ } from '@wordpress/i18n';

export default {
    id: 'email-template-customizer',
    priority: 3,
    headerTitle: __('Email Template Customizer', 'multivendorx'),
    headerDescription: __(
        'Edit and manage individual email templates used across the marketplace.',
        'multivendorx'
    ),
    headerIcon: 'adminfont-store-seo',
    submitUrl: 'settings',
    modal: [
        {
			key: 'store_registration_from',
			type: 'email-template',
			classes: 'full-width',
			desc: 'Customise personalised store registration form for marketplace.',
		},
    ]
};
