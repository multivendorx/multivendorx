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
					key: 'view_earnings',
					label: __('View earnings', 'multivendorx'),
					desc: __(
						'Allow facilitators to view their total earnings from assigned stores.',
						'multivendorx'
					),
					value: 'view_earnings',
				},
				{
					key: 'request_withdrawal',
					label: __('Request withdrawal', 'multivendorx'),
					desc: __(
						'Allow facilitators to request payout of their earnings.',
						'multivendorx'
					),
					value: 'request_withdrawal',
				},
				{
					key: 'commission_history',
					label: __('Commission history', 'multivendorx'),
					desc: __(
						'Allow facilitators to access a detailed history of commissions earned.',
						'multivendorx'
					),
					value: 'commission_history',
				},
				{
					key: 'view_transactions',
					label: __('View transactions', 'multivendorx'),
					desc: __(
						'Allow facilitators to view all transaction records related to their earnings.',
						'multivendorx'
					),
					value: 'view_transactions',
				},
			],
			selectDeselect: true,
		}
	],
};
