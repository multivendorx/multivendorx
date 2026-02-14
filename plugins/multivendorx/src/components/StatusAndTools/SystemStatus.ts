import { __ } from '@wordpress/i18n';

export default {
	id: 'system-status',
	priority: 1,
	settingTitle: __('System Status', 'multivendorx'),
	headerDescription: __(
		'Website technical details are displayed to ensure optimal performance and compatibility.',
		'multivendorx'
	),
	headerIcon: 'cogs-on-wheels',
	submitUrl: 'settings',
	modal: [
		{
			key: 'system_information',
			type: 'system-info',
			classes: 'system-info-section',
			apiLink: 'status',
			appLocalizer,
			copyButtonLabel: 'Copy All',
			copiedLabel: 'Copied!',
		},
	],
};
