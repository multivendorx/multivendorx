import { __ } from '@wordpress/i18n';

export default {
	id: 'store-status',
	priority: 3,
	headerTitle: __('Store Status', 'multivendorx'),
	headerDescription: __(
		'Control access and visibility based on store approval status. Configure how pending, denied, under review, suspended, active, and deactivated stores behave within your marketplace.',
		'multivendorx'
	),
	headerIcon: 'store-inventory',
	submitUrl: 'settings',
	
};
