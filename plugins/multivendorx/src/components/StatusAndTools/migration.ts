import { __ } from '@wordpress/i18n';

export default {
	id: 'migration',
	priority: 5,
	name: __('Migration', 'multivendorx'),
	desc: __(
		'Follow the step-by-step wizard to import products, stores, and settings effortlessly from other multivendor solutions.',
		'multivendorx'
	),
	icon: 'adminfont-migration',
	submitUrl: 'settings',
	modal: [
		{
			key: 'migrate',
			type: 'button',
			name: __('Run migration wizard', 'multivendorx'),
			label: __('Multivendor migration', 'multivendorx'),
			desc: __(
				'Seamlessly transfer your store data from your previous multivendor plugin (i.e. Dokan, WCFM and WC Vendor) using this migration tool.',
				'multivendorx'
			),
		},
	],
};
