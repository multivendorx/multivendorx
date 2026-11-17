import { __ } from '@wordpress/i18n';

// The email builder itself lives in VuloMail; this tab (see EmailTemplateCustomizerLink) opens it.
export default {
	id: 'email-template-customizer',
	priority: 3,
	headerTitle: __('Email Template Customizer', 'multivendorx'),
	headerDescription: __(
		'Edit and manage individual email templates used across the marketplace.',
		'multivendorx'
	),
	headerIcon: 'search-discovery',
	hideSettingHeader: true,
	submitUrl: 'settings',
	modal: [],
};
