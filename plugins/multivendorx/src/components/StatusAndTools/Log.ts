import { __ } from '@wordpress/i18n';

export default {
	id: 'log',
	priority: 2,
	headerTitle: __('Log', 'multivendorx'),
	headerDescription: __(
		'Site errors and events are logged for easy troubleshooting.',
		'multivendorx'
	),
	headerIcon: 'document',
	submitUrl: 'settings',
	modal: [
		{
			key: 'multivendorx_log',
			type: 'log',
			classes: 'log-section full-width',
			apiLink: 'logs',
			fileName: 'error.txt',
		},
	],
};
