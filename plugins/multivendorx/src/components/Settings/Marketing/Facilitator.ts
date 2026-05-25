/* global appLocalizer */
import { __ } from '@wordpress/i18n';

export default {
	id: 'facilitator',
	priority: 7,
	headerTitle: __('Facilitator', 'multivendorx'),
	headerDescription: __(
		'Facilitators are users who assist stores and earn a commission or fee for their role. You can define a global facilitator, assign store-specific facilitators, and configure payment rules for each.',
		'multivendorx'
	),
	headerIcon: 'facilitator',
	submitUrl: 'settings',
	moduleEnabled: 'facilitator',
	proSetting: true,
	modal: [
		{
			key: 'facilitator',
			type: 'select',
			label: __('Facilitators', 'multivendorx'),
			settingDescription: __(
				'Assign a user as a facilitator who will receive the facilitator fee.',
				'multivendorx'
			),
			desc: __(
				'Configure the facilitator fee structure directly from <a href="' +
				appLocalizer.site_url +
				'/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=commissions">this section</a>.',
				'multivendorx'
			),
			moduleEnabled: 'facilitator',
			size: '40%',
			options: appLocalizer.facilitators_list,
		},
		{
			key: 'facilitator_permissions',
			type: 'checkbox',
			label: __('Facilitator permissions', 'multivendorx'),
			settingDescription: __(
				'Define what financial and commission-related capabilities are available to facilitators.',
				'multivendorx'
			),
			options: [
				{
					key: 'read_shop_earning',
					label: __('View wallet', 'multivendorx'),
					desc: __(
						'Allow facilitators to access and view wallet earnings.',
						'multivendorx'
					),
					value: 'read_shop_earning',
				},
				{
					key: 'view_transactions',
					label: __('View transactions', 'multivendorx'),
					desc: __(
						'Allow facilitators to view all wallet transaction records.',
						'multivendorx'
					),
					value: 'view_transactions',
				},
				{
					key: 'edit_withdrawl_request',
					label: __('Request withdrawals', 'multivendorx'),
					desc: __(
						'Allow facilitators to submit withdrawal requests from wallet balance.',
						'multivendorx'
					),
					value: 'edit_withdrawl_request',
				},
				{
					key: 'read_payout_section',
					label: __('Payout Settings', 'multivendorx'),
					desc: __(
						'Allow facilitators to submit withdrawal requests from wallet balance.',
						'multivendorx'
					),
					value: 'read_payout_section',
				},
			],
			selectDeselect: true,
		}
	],
};
