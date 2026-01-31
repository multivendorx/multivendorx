import { __ } from '@wordpress/i18n';

export default {
	id: 'setup-widget',
	priority: 4,
	name: __('Setup Widget', 'multivendorx'),
	desc: __(
		'Data from your previous marketplace can be seamlessly transferred using this migration tool.',
		'multivendorx'
	),
	icon: 'adminfont-setup',
	submitUrl: 'settings',
	modal: [
		{
			key: 'setup_wizard',
			type: 'button',
			name: __('Setup Wizard', 'multivendorx'),
			label: __('Run setup wizard', 'multivendorx'),
			desc: __(
				'Launch the step-by-step wizard to configure your marketplace quickly and effortlessly.',
				'multivendorx'
			),
			link: appLocalizer.setup_wizard_url,
		},
	],
};
