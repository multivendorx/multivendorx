import { __ } from '@wordpress/i18n';

export default {
	id: 'general',
	priority: 1,
	headerTitle: __('General', 'vulopilot'),
	headerIcon: 'admin-settings',
	submitUrl: 'settings',
	modal: [
		{
			key: 'scan_frequency',
			type: 'select',
			label: __('Scan frequency', 'vulopilot'),
			desc: __(
				'How often VuloPilot runs its scheduled scans.',
				'vulopilot'
			),
			options: [
				{ label: __('Hourly', 'vulopilot'), value: 'hourly' },
				{ label: __('Daily', 'vulopilot'), value: 'daily' },
				{ label: __('Weekly', 'vulopilot'), value: 'weekly' },
			],
		},
		{
			key: 'dashboard_layout_notice',
			type: 'notice',
			label: '',
			noticeType: 'info',
			message: __(
				'Dashboard widget layout (which widgets show and in what order) is managed from the Dashboard page itself — drag and drop, or hide/show a widget directly there — not from Settings.',
				'vulopilot'
			),
		},
	],
};
