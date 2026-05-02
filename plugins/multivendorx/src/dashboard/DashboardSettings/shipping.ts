import { __ } from '@wordpress/i18n';

export default {
	id: 'shipping',
	priority: 9,
	headerTitle: __('Shipping', 'multivendorx'),
	headerDescription: __(
		'Manage your store’s shipping method, pricing rules, and location-based rates.',
		'multivendorx'
	),
	headerIcon: 'ship-station',
	module: 'store-shipping',
	modal: [],
};
