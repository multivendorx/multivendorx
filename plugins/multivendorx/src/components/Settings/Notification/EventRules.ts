import { __ } from '@wordpress/i18n';

export default {
	id: 'event-rules',
	priority: 2,
	headerTitle: 'Event Rules',
	headerDescription: __(
		'Help customers discover stores and products near them by enabling location-based search and maps.',
		'multivendorx'
	),
	headerIcon: 'adminfont-notification',
	submitUrl: 'settings',
	modal: [],
};
