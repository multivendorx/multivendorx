import { __ } from '@wordpress/i18n';

export default {
	id: 'system-status',
	priority: 1,
	name: __('System Status', 'multivendorx'),
	desc: __(
		'Website technical details are displayed to ensure optimal performance and compatibility.',
		'multivendorx'
	),
	icon: 'adminfont-cogs-on-wheels',
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
