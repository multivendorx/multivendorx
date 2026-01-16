import { __ } from '@wordpress/i18n';

export default {
	id: 'coupon',
	priority: 4,
	name: __('Coupons & Discounts', 'mvx-pro'),
	desc: __(
		'Manage how discounts and coupons affect commission calculations.',
		'mvx-pro'
	),
	icon: 'adminfont-coupon',
	submitUrl: 'settings',
	modal: [
		{
			key: 'commission_include_coupon',
			label: __('Who will bear the coupon cost', 'multivendorx'),
			type: 'setting-toggle',
			desc: __(
				'<strong>Example setup:</strong><br>Product price = $100<br>Coupon applied = 20% / $20 (Fixed)<br>Marketplace commission rate = 20%<ul><li>Stores - Marketplace passes coupon cost to the store.<br>Customer pays = $100<br>Marketplace commission = 20% of $100 = $20<br>Store payout before coupon = $80<br>Coupon amount deducted from store = $20<br>Final store payout = $60<br>Marketplace final earning = $20 (commission only, store bears coupon)</li><li>Admin - Marketplace absorbs full coupon cost.<br>Customer pays = $80 (after coupon)<br>Marketplace commission = 20% of $100 = $20<br>Store payout = $60 (Customer payment − commission)<br>Coupon absorbed by marketplace = $20<br>Marketplace final earning = $0 (commission − absorbed coupon)</li><li>His His Whose Whose - Coupon cost split between marketplace and store according to commission rate.<br>Customer pays = $80 (after coupon)<br>Marketplace commission = 20% of $100 = $20<br>Store payout before coupon = $80<br>Store share of coupon = 80% of $20 = $16<br>Final store payout = $64<br>Marketplace absorbs remaining coupon = $4<br>Marketplace final earning = $16 (commission − absorbed coupon)</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'store',
					label: __('Stores', 'multivendorx'),
					value: 'store',
				},
				{
					key: 'admin',
					label: __('Admin', 'multivendorx'),
					value: 'admin',
				},
				{
					key: 'seperate',
					label: __('His His Whose Whose', 'multivendorx'),
					value: 'seperate',
				},
			],
			look: 'toggle',
		},
		{
			key: 'admin_coupon_excluded',
			label: __('Exclude admin created coupons', 'multivendorx'),
			desc: __(
				'<li>Enabled - admin-created coupons will not reduce store commission.</li><li>Disabled - store commission adjusts according to the ‘Who will bear the coupon cost’ setting.</li>',
				'multivendorx'
			),
			type: 'checkbox',
			options: [
				{
					key: 'admin_coupon_excluded',
					value: 'admin_coupon_excluded',
				},
			],
			look: 'toggle',
		},
	],
};
