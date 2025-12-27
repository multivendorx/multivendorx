import { __ } from '@wordpress/i18n';

const methods = appLocalizer?.all_payments
	? Object.entries(appLocalizer.all_payments).map(([_, value]) => value)
	: [];

export default {
	id: 'payment-integration',
	priority: 3,
	name: __('Withdrawal Methods', 'multivendorx'),
	desc: __(
		'Choose which payment integrations to enable for store payouts.',
		'multivendorx'
	),
	icon: 'adminlib-rules',
	submitUrl: 'settings',
	wrapperClass: 'form-wrapper',
	modal: [
		{
			key: 'payment_methods',
			type: 'expandable-panel',
			buttonEnable: true,
			modal: methods,
		},
	],
};
