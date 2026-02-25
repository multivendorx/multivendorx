import { __ } from '@wordpress/i18n';

export default {
	id: 'registration',
	priority: 2,
	headerTitle: 'Registration',
	headerDescription: __(
		'Customise personalised store registration form for marketplace.',
		'multivendorx'
	),
	headerIcon: 'contact-form',
	submitUrl: 'settings',
	modal: [
		{
			key: 'registration page',
			type: 'info',
			
			notice: __(
				'Only store owners can apply for store registration. Applicants must log in or create an account before proceeding. So, Make sure WooCommerce’s Account & Privacy settings are configured to allow user registration.',
				'multivendorx'
			),
			title: '',
		},
		{
			key: 'store_registration_from',
			type: 'form-builder',
			classes: 'full-width',
			visibleGroups: ['registration', 'store'],
			desc: 'Customise personalised store registration form for marketplace.',
		},
	],
};
