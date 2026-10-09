import { __ } from '@wordpress/i18n';

export default {
	id: 'product-compliance',
	priority: 5,
	headerTitle: __('Product Compliance', 'multivendorx'),
	headerDescription: __(
		'All product listings must follow platform content guidelines and avoid prohibited categories. Branded or regulated products must include authenticity certificates. Optional safety certifications may be uploaded for regulated items.',
		'multivendorx'
	),
	headerIcon: 'per-product-shipping',
	submitUrl: 'settings',
	modal: [

	],
};
