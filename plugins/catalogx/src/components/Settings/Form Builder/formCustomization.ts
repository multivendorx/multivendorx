import { __ } from '@wordpress/i18n';

export default {
	id: 'enquiry-form-customization',
    priority: 30,
    headerTitle: __( 'Enquiry Form Builder', 'catalogx' ),
    headerDescription: __(
        'Design a personalized enquiry form with built-in form builder.',
        'catalogx'
    ),
    headerIcon: 'contact-form',
    submitUrl: 'settings',
	modal: [
		{
			key: 'registration page',
			type: 'notice',
			message: __(
				'Only store owners can apply for store registration. Applicants must log in or create an account before proceeding. So, Make sure WooCommerce’s Account & Privacy settings are configured to allow user registration.',
				'multivendorx'
			),
			noticeType: 'info',
			displayPosition: 'notice',
		},
		{
			key: 'store_registration_from',
			type: 'block-builder',
			classes: 'full-width',
			visibleGroups: ['registration'],
			desc: 'Customise personalised store registration form for marketplace.',
			context: 'form',
			proSetting: true,
		},
	],
};
