import { __ } from '@wordpress/i18n';

export default {
	id: 'store-registration-form',
	priority: 2,
	name: 'Registration',
	desc: __(
		'Customise personalised store registration form for marketplace.',
		'multivendorx'
	),
	icon: 'adminfont-contact-form',
	submitUrl: 'settings',
	modal: [
		{
			key: 'registration page',
			type: 'blocktext',
			blocktext: __(
				'Only store owners can apply for store registration. Applicants must log in or create an account before proceeding. So, Make sure WooCommerce’s Account & Privacy settings are configured to allow user registration.',
				'multivendorx'
			),
		},
		{
			key: 'store_registration_from',
			type: 'form-builder',
			desc: 'Customise personalised store registration form for marketplace.',
		},
		// {
		//     key: 'disable_setup_wizard',
		//     type: 'checkbox',
		//     label: __( 'Disable Wizard', 'multivendorx' ),
		//     desc: __(
		//         'Enable this to disable the setup wizard for stores. When disabled, stores will not be shown the onboarding steps after registration or login.',
		//         'multivendorx'
		//     ),
		//     options: [
		//         {
		//             key: 'disable_setup_wizard',
		//             value: 'disable_setup_wizard',
		//         },
		//     ],
		//     look: 'toggle',
		// },
		// {
		//     key: 'setup_wizard_introduction',
		//     type: 'textarea',
		//     label: __(
		//         'Store Setup wizard Introduction Message',
		//         'multivendorx'
		//     ),
		//     desc: __(
		//         'Welcome stores with creative onboard messages',
		//         'multivendorx'
		//     ),
		// },
	],
};
