import { __ } from '@wordpress/i18n';

export default {
	id: 'live-chat',
	priority: 5,
	headerTitle: __('Live Chat', 'multivendorx'),
	headerDescription: __(
		'Set up and manage live chat options for customer interaction.',
		'multivendorx'
	),
	headerIcon: 'live-chat',
	submitUrl: 'settings',
	modal: [
		{
			key: 'product_page_chat',
			type: 'choice-toggle',
			label: __('Chat button position', 'multivendorx'),
			desc: __(
				'Choose where the chat button will appear on product/listing pages.',
				'multivendorx'
			),
			moduleEnabled: 'live-chat',
			options: [
				{
					key: 'add_to_cart_button',
					label: __('Next to Add to Cart button', 'multivendorx'),
					value: 'add_to_cart_button',
				},
				{
					key: 'store_info',
					label: __('Inside Store details tab', 'multivendorx'),
					value: 'store_info',
				},
				{
					key: 'both',
					label: __('Both', 'multivendorx'),
					value: 'both',
				},
			],
			proSetting: true,
		},
		{
			key: 'chat_provider',
			type: 'choice-toggle',
			label: __('Chat platform integration', 'multivendorx'),
			desc: __(
				'Select the chat provider you want to connect with your store. For step-by-step setup instructions, please check our documentation.',
				'multivendorx'
			),

			moduleEnabled: 'live-chat',
			options: [
				{
					key: 'facebook',
					label: __('Facebook Messenger', 'multivendorx'),
					value: 'facebook',
				},
				{
					key: 'talkjs',
					label: __('TalkJS', 'multivendorx'),
					value: 'talkjs',
					// 		desc: __(
					// 	'<a href="https://docs.mapbox.com/help/getting-started/access-tokens/" target="_blank">Click here to generate access token.</a>',
					// 	'multivendorx'
					// ),
				},
				{
					key: 'whatsapp',
					label: __('WhatsApp', 'multivendorx'),
					value: 'whatsapp',
				},
				{
					key: 'tawk',
					label: __('Tawk.to', 'multivendorx'),
					value: 'tawk',
				},
			],
			proSetting: true,
		},
		{
			key: 'app_id',
			type: 'text',
			label: __('TalkJS App ID', 'multivendorx'),
			desc: __(
				'Enter your TalkJS App ID. Go to the <a href="https://talkjs.com/dashboard" target="_blank">TalkJS dashboard</a> → select your project → copy the App ID.',
				'multivendorx'
			),
			dependent: {
				key: 'chat_provider',
				set: true,
				value: 'talkjs',
			},
			moduleEnabled: 'live-chat',
			proSetting: true,
		},
		{
			key: 'app_secret',
			type: 'text',
			label: __('TalkJS App Secret', 'multivendorx'),
			desc: __(
				'Enter the App Secret for the selected TalkJS project. Copy it from the project settings in your <a href="https://talkjs.com/dashboard" target="_blank">TalkJS dashboard.</a>',
				'multivendorx'
			),
			dependent: {
				key: 'chat_provider',
				set: true,
				value: 'talkjs',
			},
			moduleEnabled: 'live-chat',
			proSetting: true,
		},
	],
};
