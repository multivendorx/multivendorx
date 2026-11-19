import { __ } from '@wordpress/i18n';

/**
 * What MultiVendorX Pro adds, as the dashboard's Pro card and Settings → License (without Pro) list it. One list, so
 * the two never disagree.
 */
export const PRO_FEATURES = [
	{
		icon: 'commission',
		title: __('Membership rewards & commission', 'multivendorx'),
		desc: __(
			'Charge stores a monthly or yearly fee to sell on your marketplace: predictable revenue every month.',
			'multivendorx'
		),
	},
	{
		icon: 'verification3',
		title: __('Verified stores only', 'multivendorx'),
		desc: __(
			'Screen stores with document verification and approval, so buyers trust your marketplace from day one.',
			'multivendorx'
		),
	},
	{
		icon: 'marketplace',
		title: __('Diversified marketplace', 'multivendorx'),
		desc: __(
			'Bookings, subscriptions and auctions alongside simple products.',
			'multivendorx'
		),
	},
	{
		icon: 'vacation',
		title: __('Vacation mode for stores', 'multivendorx'),
		desc: __(
			'Stores pause for a while and buyers are told automatically.',
			'multivendorx'
		),
	},
	{
		icon: 'store-inventory',
		title: __('Never run out of stock', 'multivendorx'),
		desc: __(
			'Inventory tracking with low-stock alerts keeps stores ready and buyers happy.',
			'multivendorx'
		),
	},
	{
		icon: 'notification',
		title: __('Autopilot notifications', 'multivendorx'),
		desc: __(
			'Emails and alerts for every order, refund and payout, so everyone stays in the loop.',
			'multivendorx'
		),
	},
];
