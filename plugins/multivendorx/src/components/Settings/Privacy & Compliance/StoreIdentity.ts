import { __ } from '@wordpress/i18n';

export default {
	id: 'store-identity',
	priority: 3,
	headerTitle: __('Store Identity', 'multivendorx'),
	headerDescription: __(
		'Seller verification confirms a store identity with address, contact, and social profiles-building trust and boosting buyer confidence.',
		'multivendorx'
	),
	headerIcon: 'identity-verification',
	submitUrl: 'settings',

	modal: [
		{
			key: 'badge_img',
			type: 'setting-toggle',
			label: __('Verified badge', 'multivendorx'),
			desc: __(
				'Select a badge from the list above. Once a store is verified, the chosen badge will appear beside its name.',
				'multivendorx'
			),
			moduleEnabled: 'marketplace-compliance',
			proSetting: true,
			options: [
				{
					key: 'adminfont-verification1',
					value: __('adminfont-verification1', 'multivendorx'),
					icon: 'adminfont-verification1',
				},
				{
					key: 'adminfont-verification2',
					value: __('adminfont-verification2', 'multivendorx'),
					icon: 'adminfont-verification2',
				},
				{
					key: 'adminfont-verification3',
					value: __('adminfont-verification3', 'multivendorx'),
					icon: 'adminfont-verification3',
				},
				{
					key: 'adminfont-verification5',
					value: __('adminfont-verification5', 'multivendorx'),
					icon: 'adminfont-verification5',
				},
				{
					key: 'adminfont-verification7',
					value: __('adminfont-verification7', 'multivendorx'),
					icon: 'adminfont-verification7',
				},
				{
					key: 'adminfont-verification9',
					value: __('adminfont-verification9', 'multivendorx'),
					icon: 'adminfont-verification9',
				},
			],
		},
		{
			key: 'separator_content',
			type: 'section',
			title: __('Identity Verification', 'multivendorx'),
			desc: __(
				'Verify store identity using government-issued documents or facial recognition. Ensures authenticity of users.'
			),
		},
		{
			key: 'verification_methods',
			type: 'expandable-panel',
			moduleEnabled: 'marketplace-compliance',
			proSetting: true,
			label: __('Verification methods', 'multivendorx'),
			addNewBtn: true,
			addNewTemplate: {
				label: 'New Verification Method',
				desc: 'Configure your custom verification methods',
			},
			modal: [
				{
					id: 'business-registration',
					label: 'Business registration certificate',
					isCustom: true,
					desc: 'Confirms the store is legally registered as a business entity.',
				},
				{	
					id: 'trade-license',
					label: 'Trade license or permit',
					isCustom: true,
					desc: 'Validates that the store is authorized to operate and conduct business legally.'
				},
				{
					id: 'address-proof',
					label: 'Address proof of business location',
					isCustom: true,
					desc: 'Confirms the store’s physical or operational business address.',
				},
			],
		},
		{
			key: 'separator_content',
			type: 'section',
			title: __('Social Verification', 'multivendorx'),
			desc: __(
				'Allow stores to verify their identity by connecting social media accounts.'
			),
		},
		{
			key: 'all_verification_methods',
			type: 'expandable-panel',
			label: 'Social verification',
			moduleEnabled: 'marketplace-compliance',
			proSetting: true,
			modal: [
				{
					id: 'google-connect',
					icon: 'adminfont-google',
					label: 'Google',
					connected: false,
					disableBtn: true,
					desc: 'Connect and authenticate stores via Google accounts.',
					formFields: [
						{
							key: 'client_id',
							type: 'text',
							label: 'Google Client ID',
							placeholder: 'Enter Google Client ID',
							desc: __( '<a href="https://docs.mapbox.com/help/getting-started/access-tokens/" target="_blank">Click here to generate access token.</a>', 'multivendorx' ),
						},
						{
							key: 'client_secret',
							type: 'text',
							label: 'Google Client Secret',
							placeholder: 'Enter Google Client Secret',
						},
						{
							key: 'redirect_uri',
							type: 'text',
							label: 'Redirect URI',
							placeholder: 'Enter Redirect URI',
						},
					],
				},
				{
					id: 'twitter-connect',
					icon: 'adminfont-twitter',
					label: 'Twitter',
					connected: false,
					disableBtn: true,
					countBtn: false,
					desc: 'Connect and authenticate stores via Twitter accounts.',
					formFields: [
						{
							key: 'api_key',
							type: 'text',
							label: 'Twitter API Key',
							placeholder: 'Enter Twitter API Key',
							desc: __( '<a href="https://docs.mapbox.com/help/getting-started/access-tokens/" target="_blank">Click here to generate access token.</a>', 'multivendorx' ),
						},
						{
							key: 'api_secret_key',
							type: 'text',
							label: 'Twitter API Secret Key',
							placeholder: 'Enter Twitter API Secret Key',
						},
						{
							key: 'bearer_token',
							type: 'text',
							label: 'Bearer Token',
							placeholder: 'Enter Bearer Token',
						},
					],
				},
				{
					id: 'facebook-connect',
					icon: 'adminfont-facebook',
					label: 'Facebook',
					connected: false,
					disableBtn: true,
					countBtn: false,
					desc: 'Connect and authenticate stores via Facebook accounts.',
					formFields: [
						{
							key: 'app_id',
							type: 'text',
							label: 'Facebook App ID',
							placeholder: 'Enter Facebook App ID',
							desc: __( '<a href="https://docs.mapbox.com/help/getting-started/access-tokens/" target="_blank">Click here to generate access token.</a>', 'multivendorx' ),
						},
						{
							key: 'app_secret',
							type: 'text',
							label: 'Facebook App Secret',
							placeholder: 'Enter Facebook App Secret',
						},
					],
				},
				{
					id: 'linkedin-connect',
					icon: 'adminfont-linkedin',
					label: 'LinkedIn',
					disableBtn: true,
					countBtn: false,
					desc: 'Connect and authenticate stores via LinkedIn accounts.',
					formFields: [
						{
							key: 'client_id',
							type: 'text',
							label: 'LinkedIn Client ID',
							placeholder: 'Enter LinkedIn Client ID',
							desc: __( '<a href="https://docs.mapbox.com/help/getting-started/access-tokens/" target="_blank">Click here to generate access token.</a>', 'multivendorx' ),
						},
						{
							key: 'client_secret',
							type: 'text',
							label: 'LinkedIn Client Secret',
							placeholder: 'Enter LinkedIn Client Secret',
						},
						{
							key: 'redirect_uri',
							type: 'text',
							label: 'Redirect URI',
							placeholder: 'Enter Redirect URI',
						},
					],
				},
			],
		},
	],
};
