import { __ } from '@wordpress/i18n';

export default {
	id: 'notifications',
	priority: 2,
	headerTitle: __('Notifications', 'vulopilot'),
	headerIcon: 'email',
	submitUrl: 'settings',
	modal: [
		{
			key: 'notification_email',
			type: 'email',
			label: __('Notification email', 'vulopilot'),
			placeholder: __('noreply@yourstore.com', 'vulopilot'),
			desc: __(
				'Where critical findings and automation failures are sent. Falls back to the site admin email when left blank.',
				'vulopilot'
			),
		},
		{
			key: 'notify_on_critical_findings',
			type: 'checkbox',
			look: 'toggle',
			label: __('Email me on critical findings', 'vulopilot'),
			desc: __(
				'Send an email whenever a scan raises a new critical-severity finding.',
				'vulopilot'
			),
			options: [
				{ key: 'enabled', label: '', value: 'enabled' },
			],
		},
		{
			key: 'email_from_name',
			type: 'text',
			label: __('Email from name', 'vulopilot'),
			desc: __(
				'The name VuloPilot\'s own emails (notifications, automation actions, scheduled reports) are sent from. Defaults to your site name.',
				'vulopilot'
			),
		},
		{
			key: 'email_from_address',
			type: 'email',
			label: __('Email from address', 'vulopilot'),
			placeholder: __('noreply@yourstore.com', 'vulopilot'),
			desc: __(
				'The address VuloPilot\'s own emails are sent from. Leave blank to use your site\'s default mail sender.',
				'vulopilot'
			),
		},
	],
};
