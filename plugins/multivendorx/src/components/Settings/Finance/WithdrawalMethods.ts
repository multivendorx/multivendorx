import { __ } from '@wordpress/i18n';

const methods = appLocalizer?.all_payments
	? Object.entries(appLocalizer.all_payments).map(([_, value]) => value)
	: [];

export default {
	id: 'withdrawal-methods',
	priority: 3,
	name: __('Withdrawal Methods', 'multivendorx'),
	desc: __(
		'Choose which payment integrations to enable for store payouts.',
		'multivendorx'
	),
	icon: 'adminfont-rules',
	submitUrl: 'settings',
	wrapperClass: 'form-wrapper',
	modal: [
		{
			key: 'payment_methods',
			type: 'expandable-panel',
			// buttonEnable: true,
			modal: methods,
		},
	],
};
