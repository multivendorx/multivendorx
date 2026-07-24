import { __ } from '@wordpress/i18n';

export default {
	id: 'reports',
	priority: 5,
	headerTitle: __('Reports', 'vulopilot'),
	headerIcon: 'media-document',
	submitUrl: 'settings',
	modal: [
		{
			key: 'default_report_format',
			type: 'select',
			label: __('Default export format', 'vulopilot'),
			desc: __(
				'Used when generating a report without explicitly choosing a format.',
				'vulopilot'
			),
			options: [
				{ label: __('PDF', 'vulopilot'), value: 'pdf' },
				{ label: __('CSV', 'vulopilot'), value: 'csv' },
				{ label: __('JSON', 'vulopilot'), value: 'json' },
			],
		},
		{
			key: 'default_report_period_days',
			type: 'number',
			label: __('Default report period (days)', 'vulopilot'),
			minNumber: 1,
			maxNumber: 365,
			desc: __(
				'Used when generating a report without explicitly choosing a date range.',
				'vulopilot'
			),
		},
	],
};
