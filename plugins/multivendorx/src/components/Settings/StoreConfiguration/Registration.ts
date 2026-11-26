import { __ } from '@wordpress/i18n';

export default {
	id: 'registration',
	priority: 2,
	headerTitle: __('Registration', 'multivendorx'),
	headerDescription: __(
		'Preview the store registration form and edit it in VuloForm.',
		'multivendorx'
	),
	headerIcon: 'contact-form',
	hideSettingHeader: true,
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
	],
};
