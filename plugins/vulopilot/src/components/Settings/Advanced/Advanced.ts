import { __ } from '@wordpress/i18n';

export default {
	id: 'advanced',
	priority: 1,
	headerTitle: __('Advanced', 'vulopilot'),
	headerIcon: 'admin-tools',
	submitUrl: 'settings',
	modal: [
		{
			key: 'enable_debug_logging',
			type: 'checkbox',
			look: 'toggle',
			label: __('Enable debug logging', 'vulopilot'),
			desc: __(
				'Writes report-generation failures to the server error log, in addition to the failure reason already shown on the Reports page. Leave off unless you\'re actively debugging.',
				'vulopilot'
			),
			options: [
				{ key: 'enabled', label: '', value: 'enabled' },
			],
		},
	],
};
