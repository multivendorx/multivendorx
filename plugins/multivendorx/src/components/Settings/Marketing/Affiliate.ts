import { __ } from '@wordpress/i18n';

export default {
	id: 'affiliate',
	priority: 4,
	name: __('Affiliate', 'multivendorx'),
	desc: __(
		'Decide whose share will be reduced when paying affiliate commissions. The payout can either be deducted from the admin’s commission or from the store’s earnings.',
		'multivendorx'
	),
	blocktext: __(
    '<b>Note: </b>This setting manages how affiliate payments are handled for each store. To adjust commission rules, payout methods, or other affiliate details, please visit the <b><a href="#&tab=settings&subtab=affiliate">Affiliate Plugin Settings</a></b> section.',
    'multivendorx'
),
	icon: 'adminfont-wp-affiliate',
	submitUrl: 'settings',
	moduleEnabled: 'wp-affiliate',
	modal: [
		{
			key: 'approve_store',
			type: 'setting-toggle',
			label: __('Who pays affiliate commissions', 'multivendorx'),
			desc: __('Select who is responsible for paying affiliate referral commissions:<ul><strong>Example setup:</strong><br>' + 'Total product/listing price = $1,000<br>' + 'Marketplace commission = 20%<br>' + 'Affiliate commission = $50 + 5%<br>' + '<em>(Affiliate commission is calculated on the total product price)</em>' + '<ul>' + '<li><strong>Option 1 – Admin pays affiliate:</strong><br>' + 'Marketplace commission = (20% of $1,000) - 100 = $100<br>' + 'Affiliate commission = $50 + 5% of $1,000 = $100<br>' + 'Store receives = $1,000 − $200 = $800<br>' + '<em>(Affiliate cost is covered by the marketplace)</em></li>' + '<li><strong>Option 2 – Store pays affiliate:</strong><br>' + 'Marketplace commission = 20% of $1,000 = $200<br>' + 'Affiliate commission = $50 + 5% of $1,000 = $100<br>' + 'Store receives = $1,000 − ($200 + $100) = $700</li>' + '</ul>', 'multivendorx' ),
			proSetting: true,
			moduleEnabled: 'wp-affiliate',
			options: [
				{
					key: 'admin',
					label: __('Admin', 'multivendorx'),
					value: 'admin',
				},
				{
					key: 'store',
					label: __('Store', 'multivendorx'),
					value: 'store',
				},
			],
		},
	],
};
