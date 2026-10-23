import { __ } from '@wordpress/i18n';

export default {
	id: 'events-delivery',
	priority: 1,
	headerTitle: __('Events Delivery','multivendorx'),
	settingTitle: 'Email & SMS delivery',
	headerDescription: __(
		'Get notified about important updates by email. Sender identity, SMS gateways, and the admin SMS number are now configured in VuloMail.',
		'multivendorx'
	),
	headerIcon: 'notification',
	groupBySections: true,
	hideSettingHeader: true,
	submitUrl: 'settings',
	modal: [
		{
			key: 'section',
			type: 'section',
			icon: 'notification',
			title: __('Notification recipients', 'multivendorx'),
		},
		{
			key: 'receiver_email_address',
			type: 'email',
			size: '50%',
			label: __('Admin email recipient', 'multivendorx'),
			placeholder: __('noreply@yourstore.com', 'multivendorx'),
			settingDescription: __(
				'The primary email address that will receive system and marketplace notifications. VuloMail has no equivalent setting, so this stays here.',
				'multivendorx'
			),
			desc: __(
				'You can add multiple email addresses separated by commas to notify additional recipients.',
				'multivendorx'
			),
		},
	],
};
