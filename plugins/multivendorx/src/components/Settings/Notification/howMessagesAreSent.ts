import { __ } from '@wordpress/i18n';

export default {
	id: 'notification-configuration',
	priority: 1,
	name: 'How messages are sent',
	tabTitle: 'Email & SMS delivery',
	desc: __(
		'Define who receives notification messages from the marketplace.',
		'multivendorx'
	),
	icon: 'adminfont-notification',
	submitUrl: 'settings',
	modal: [

		{
			key: 'sender_email_address',
			type: 'email',
			label: __('Admin email recipient', 'multivendorx'),
			placeholder: __('noreply@yourstore.com', 'multivendorx'),
			settingDescription: __(
				'The primary email address that will receive system and marketplace notifications.',
				'multivendorx'
			),
			desc: __('You can add multiple email addresses separated by commas to notify additional recipients.','multivendorx'),
		},
		{
			key: 'sms_receiver_phone_number',
			type: 'text',
			label: __('Receiver phone number', 'multivendorx'),
			placeholder: __('9000012345', 'multivendorx'),
			preInsideText: 'country-code-select',
			settingDescription: __(
				'The phone number that will receive SMS notifications. Use country code followed by phone number. Example: +44 – 7123456789, +91 – 9000012345',
				'multivendorx'
			),
		},
		{
			key: 'sms_section',
			type: 'section',
			hint: __('Email delivery settings', 'multivendorx'),
		},
		{
			key: 'email_provider',
			type: 'setting-toggle',
			label: __('Email provider', 'multivendorx'),
			desc: __('<ul>Use the WordPress-supported SMTP plugin, which you can find here: <a href="https://wordpress.org/plugins/tags/smtp/" target="_blank">WordPress SMTP Plugins</a>.<br><strong>Important:</strong> <strong>Sender Email Address</strong> configured in your SMTP plugin match the sender email set in your email delivery setup settings.<br>Otherwise, WordPress may fall back to its default mail method.</ul>',
				'multivendorx'
			),
		},
		{
			key: 'sender_name',
			type: 'text',
			label: __('Sender name', 'multivendorx'),
			placeholder: __('Marketplace Team', 'multivendorx'),
			settingDescription: __(
				'The name that will appear in the "From" field of outgoing emails.',
				'multivendorx'
			),
		},

		{
			key: 'sender_email_address',
			type: 'email',
			label: __('Sender email address', 'multivendorx'),
			placeholder: __('noreply@yourstore.com', 'multivendorx'),
			settingDescription: __(
				'The email address from which marketplace notifications will be sent.',
				'multivendorx'
			),
			desc: __(
				'The email address from which notifications are sent is provided. Test emails can be sent to confirm delivery.',
				'multivendorx'
			),
		},
		{
			key: 'sms_section',
			type: 'section',
			hint: __('SMS delivery settings', 'multivendorx'),
		},
		{
			key: 'sms_sender_phone_number',
			type: 'text',
			label: __('Sender phone number', 'multivendorx'),
			placeholder: __('4151234567', 'multivendorx'),
			preInsideText: 'country-code-select',
			settingDescription: __(
				'The phone number SMS messages are sent from. Use country code followed by phone number. Example: +1 – 4151234567, +91 – 9876543210',
				'multivendorx'
			),
		},
		{
			key: 'sms_section',
			type: 'section',
			hint: __('SMS configuration', 'multivendorx'),
		},
		{
			key: 'sms_gateway_selector',
			type: 'setting-toggle',
			label: __('Select SMS gateway', 'multivendorx'),
			settingDescription: __(
				'Pick the SMS service your marketplace will use to send text alerts.',
				'multivendorx'
			),
			options: [
				{
					key: 'none',
					label: __('None', 'multivendorx'),
					value: '',
				},
				{
					key: 'twilio',
					label: __('Twilio', 'multivendorx'),
					value: 'twilio',

				},
				{
					key: 'vonage',
					label: __('Vonage', 'multivendorx'),
					value: 'vonage',
				},
				{
					key: 'clickatell',
					label: __('Clickatell', 'multivendorx'),
					value: 'clickatell',
				},
				{
					key: 'plivo',
					label: __('Plivo', 'multivendorx'),
					value: 'plivo',
				},
			],
		},
		{
			key: 'twilio_account_sid',
			type: 'text',
			label: __('Account SID', 'multivendorx'),
			desc: __('<ul> Send SMS notifications using Twilio.<br> Get your <strong>Account SID</strong> and <strong>Auth Token</strong> from your Twilio dashboard: <a href="https://www.twilio.com/console" target="_blank">Twilio Console</a>.<br> <strong>Important:</strong> Make sure the Account SID and Token you enter here match your Twilio account details exactly.<br> Follow Twilio’s setup instructions to complete the SMS gateway configuration. </ul>', 'multivendorx'),
			dependent: {
				key: 'sms_gateway_selector',
				set: true,
				value: 'twilio',
			},
		},
		{
			key: 'twilio_auth_token',
			type: 'text',
			label: __('Auth Token', 'multivendorx'),
			dependent: {
				key: 'sms_gateway_selector',
				set: true,
				value: 'twilio',
			},
		},
		{
			key: 'vonage_api_key',
			type: 'text',
			label: __('API Key', 'multivendorx'),
			desc: __('<ul> Send SMS notifications using Vonage (formerly Nexmo).<br> Get your <strong>API Key</strong> and <strong>API Secret</strong> from your Vonage dashboard: <a href="https://dashboard.nexmo.com" target="_blank">Vonage Dashboard</a>.<br> <strong>Important:</strong> Make sure the API Key and Secret you enter here match your Vonage account details exactly.<br> Follow Vonage’s setup instructions to complete the SMS gateway configuration. </ul>', 'multivendorx'),
			dependent: {
				key: 'sms_gateway_selector',
				set: true,
				value: 'vonage',
			},
		},
		{
			key: 'vonage_api_secret',
			type: 'text',
			label: __('API Secret', 'multivendorx'),
			dependent: {
				key: 'sms_gateway_selector',
				set: true,
				value: 'vonage',
			},
		},
		{
			key: 'clickatell_api_key',
			type: 'text',
			label: __('API Key', 'multivendorx'),
			desc: __('<ul> Send SMS notifications using Clickatell.<br> Get your <strong>API Key</strong> from your Clickatell dashboard: <a href="https://platform.clickatell.com/" target="_blank">Clickatell Dashboard</a>.<br> <strong>Important:</strong> Make sure the API Key you enter here matches your Clickatell account details exactly.<br> Follow Clickatell’s setup instructions to complete the SMS gateway configuration. </ul>', 'multivendorx'),
			dependent: {
				key: 'sms_gateway_selector',
				set: true,
				value: 'clickatell',
			},
		},
		{
			key: 'plivo_auth_id',
			type: 'text',
			label: __('Auth ID', 'multivendorx'),
			desc: __('<ul> Send SMS notifications using Plivo.<br> Get your <strong>Auth ID</strong> and <strong>Auth Token</strong> from your Plivo dashboard: <a href="https://console.plivo.com/" target="_blank">Plivo Console</a>.<br> <strong>Important:</strong> Make sure the Auth ID and Token you enter here match your Plivo account details exactly.<br> Follow Plivo’s setup instructions to complete the SMS gateway configuration. </ul>', 'multivendorx'),
			dependent: {
				key: 'sms_gateway_selector',
				set: true,
				value: 'plivo',
			},
		},
		{
			key: 'plivo_auth_token',
			type: 'text',
			label: __('Auth Token', 'multivendorx'),
			dependent: {
				key: 'sms_gateway_selector',
				set: true,
				value: 'plivo',
			},
		},
		
	],
};
