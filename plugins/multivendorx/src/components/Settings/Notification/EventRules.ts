import { __ } from '@wordpress/i18n';

export default {
	id: 'event-rules',
	priority: 2,
	headerTitle: __('Event Rules','multivendorx'),
	headerDescription: __(
		'Help customers discover stores and products near them by enabling location-based search and maps.',
		'multivendorx'
	),
	headerIcon: 'notification',
	submitUrl: 'settings',
	modal: [],
};
