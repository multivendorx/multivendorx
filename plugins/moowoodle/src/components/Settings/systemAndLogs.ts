import { __ } from '@wordpress/i18n';

export default {
	id: 'system-logs',
	priority: 3,
	headerTitle: __('System & Logs', 'moowoodle'),
	headerDescription: __(
		'Manage advanced settings for synchronization, error logging, and connection handling.',
		'moowoodle'
	),
	headerIcon: 'tools',
	groupBySections: true,
	hideSettingHeader: true,
	submitUrl: 'settings',
	modal: [
		{
			key: 'system-logs-section-timing',
			type: 'section',
			icon: 'tools',
			title: __('Connection & schedule', 'moowoodle'),
			desc: __(
				'How long to wait for Moodle, and how often the automatic synchronization runs.',
				'moowoodle'
			),
		},
		{
			key: 'moodle_timeout',
			type: 'text',
			settingDescription: __(
				'When WordPress sends a request to the Moodle server for data, communication delays might exceed the default server connection timeout. You can customize the timeout parameters by adjusting them here. <br>Default: 5 seconds.',
				'moowoodle'
			),
			size: 8,
			postInsideText: __('sec', 'moowoodle'),
			label: __('Connection timeout', 'moowoodle'),
			parameter: __('Seconds', 'moowoodle'),
		},
		{
			key: 'schedule_interval',
			type: 'text',
			settingDescription: __(
				'Select the interval for the user synchronization process. Based on this schedule, the cron job will run to sync users between WordPress and Moodle.',
				'moowoodle'
			),
			size: 8,
			postInsideText: __('min', 'moowoodle'),
			parameter: __('Minutes', 'moowoodle'),
			label: __('Automatic synchronization frequency', 'moowoodle'),
		},
		{
			key: 'system-logs-section-logs',
			type: 'section',
			icon: 'info',
			title: __('Logs', 'moowoodle'),
			desc: __(
				'Error details for troubleshooting. Leave advanced logging off in normal operation.',
				'moowoodle'
			),
		},
		{
			key: 'moowoodle_adv_log',
			type: 'checkbox',
			label: __('Advance log', 'moowoodle'),
			settingDescription: __(
				`<span class="highlighted-part">Activating this option will log more detailed error information. Enable it only when essential, as it may result in a larger log file.</span>`,
				'moowoodle'
			),
			options: [
				{
					key: 'moowoodle_adv_log',
					value: 'moowoodle_adv_log',
				},
			],
			look: 'toggle',
		},
		{
			// Its own key, not the Advance log toggle's above: zyra keys each field by `key`, and the viewer stores no
			// value of its own (it only reads `apiLink`/`fileName`).
			key: 'moowoodle_log_viewer',
			type: 'log',
			classes: 'log-section full-width row',
			apiLink: 'logs',
			fileName: 'error.txt',
		},
	],
};
