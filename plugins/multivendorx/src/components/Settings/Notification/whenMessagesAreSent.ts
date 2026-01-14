import { __ } from '@wordpress/i18n';

export default {
	id: 'notifications',
	priority: 2,
	name: 'Event rules',
	desc: __(
		'Help customers discover stores and products near them by enabling location-based search and maps.',
		'multivendorx'
	),
	icon: 'adminfont-notification',
	submitUrl: 'settings',
	modal: [],
};
