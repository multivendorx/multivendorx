import { __ } from '@wordpress/i18n';

export default {
	id: 'identity-verification',
	priority: 3,
	name: __('Store Identity', 'mvx-pro'),
	desc: __(
		'Seller verification confirms a store identity with address, contact, and social profiles-building trust and boosting buyer confidence.',
		'mvx-pro'
	),
	icon: 'adminlib-identity-verification',
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
					key: 'adminlib-verification1',
					value: __('adminlib-verification1', 'multivendorx'),
					icon: 'adminlib-verification1',
				},
				{
					key: 'adminlib-verification2',
					value: __('adminlib-verification2', 'multivendorx'),
					icon: 'adminlib-verification2',
				},
				{
					key: 'adminlib-verification3',
					value: __('adminlib-verification3', 'multivendorx'),
					icon: 'adminlib-verification3',
				},
				{
					key: 'adminlib-verification5',
					value: __('adminlib-verification5', 'multivendorx'),
					icon: 'adminlib-verification5',
				},
				{
					key: 'adminlib-verification7',
					value: __('adminlib-verification7', 'multivendorx'),
					icon: 'adminlib-verification7',
				},
				{
					key: 'adminlib-verification9',
					value: __('adminlib-verification9', 'multivendorx'),
					icon: 'adminlib-verification9',
				},
			],
		},
		{
			key: 'separator_content',
			type: 'section',
			hint: __('Identity Verification', 'multivendorx'),
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
			buttonEnable: true,
			addNewBtn: true,
			addNewTemplate: {
				label: 'New Verification Method',
				desc: 'Configure your custom verification methods',

				formFields: [
					{
						key: 'title',
						type: 'text',
						label: 'Method title',
						placeholder: 'Enter title',
					},
					{
						key: 'description',
						type: 'textarea',
						label: 'Description',
					},
					{
						key: 'required',
						type: 'checkbox',
						label: 'Required',
					},
				],
			},
			modal: [
				{
					id: 'business-registration',
					label: 'Business registration certificate',
					required: true,
					desc: 'Confirms the store is legally registered as a business entity.',
					formFields: [
					{
						key: 'title',
						type: 'text',
						label: 'Method title',
						placeholder: 'Enter title',
					},
					{
						key: 'description',
						type: 'textarea',
						label: 'Description',
					},
					{
						key: 'required',
						type: 'checkbox',
						label: 'Required',
					},
				],
				},
				{	
					id: 'trade-license',
					label: 'Trade license or permit',
					required: true,
					desc: 'Validates that the store is authorized to operate and conduct business legally.',
					formFields: [
					{
						key: 'title',
						type: 'text',
						label: 'Method title',
						placeholder: 'Enter title',
					},
					{
						key: 'description',
						type: 'textarea',
						label: 'Description',
					},
					{
						key: 'required',
						type: 'checkbox',
						label: 'Required',
					},
				]
				},
				{
					id: 'address-proof',
					label: 'Address proof of business location',
					required: true,
					desc: 'Confirms the store’s physical or operational business address.',
					formFields: [
					{
						key: 'title',
						type: 'text',
						label: 'Method title',
						placeholder: 'Enter title',
					},
					{
						key: 'description',
						type: 'textarea',
						label: 'Description',
					},
					{
						key: 'required',
						type: 'checkbox',
						label: 'Required',
					},
				]
				},
			],
		},
		{
			key: 'separator_content',
			type: 'section',
			hint: __('Social Verification', 'multivendorx'),
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
					icon: 'adminlib-google',
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
						},
						{
							key: 'client_secret',
							type: 'password',
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
					icon: 'adminlib-twitter',
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
						},
						{
							key: 'api_secret_key',
							type: 'password',
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
					icon: 'adminlib-facebook',
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
						},
						{
							key: 'app_secret',
							type: 'password',
							label: 'Facebook App Secret',
							placeholder: 'Enter Facebook App Secret',
						},
					],
				},
				{
					id: 'linkedin-connect',
					icon: 'adminlib-linkedin',
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
						},
						{
							key: 'client_secret',
							type: 'password',
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
