import { __ } from '@wordpress/i18n';

export default {
	id: 'intelligence',
	priority: 10,
	name: 'Intelligence',
	headerTitle: 'API Keys',
	moduleEnabled: 'marketplace-intelligence',
	headerDescription: __(
		'AI services can be enabled to assist with creating product details and enhancing images automatically. These settings can be configured to control which AI services are used.',
		'multivendorx'
	),
	headerIcon: 'ai',
	submitUrl: 'settings',
	modal: [
		// --- Gemini API Key Section ---
		{
			key: 'gemini_api_key',
			type: 'text',
			label: __('Gemini', 'multivendorx'),
			settingDescription: __(
				'Google’s AI can be enabled to assist with product content and image improvements.',
				'multivendorx'
			),
			desc: __(
				'<a href="https://ai.google.dev/gemini-api/docs/api-key" target="_blank">Click here to generate your Gemini API key.</a>',
				'multivendorx'
			),
		},
		// --- OpenAI API Key Section ---
		{
			key: 'openai_api_key',
			type: 'text',
			label: __('OpenAI (for ChatGPT)', 'multivendorx'),
			settingDescription: __(
				'ChatGPT-powered AI can be enabled for intelligent product content creation.',
				'multivendorx'
			),
			desc: __(
				'<a href="https://platform.openai.com/api-keys" target="_blank">Click here to generate your OpenAI API key.</a>',
				'multivendorx'
			),
		},
		{
			key: 'openrouter_api_key',
			type: 'text',
			label: __('OpenRouter (Text AI)', 'multivendorx'),
			settingDescription: __(
				'API key used for text-based AI features such as product name and description generation.',
				'multivendorx'
			),
			desc: __(
				'<a href="https://openrouter.ai/settings/keys" target="_blank">Generate an OpenRouter API key</a>',
				'multivendorx'
			),
		},
		// --- AI Provider Choice ---
		{
			key: 'section',
			type: 'section',
			title: __('Product AI', 'multivendorx'),
			desc: __(
				'AI can be used to suggest product titles, descriptions, and other details automatically. The AI provider and model can be selected here.',
				'multivendorx'
			),
			moduleEnabled: 'marketplace-intelligence',
		},
		{
			key: 'choose_ai_provider',
			type: 'setting-toggle',
			defaultValue: 'gemini_api',
			label: __('Default AI Provider', 'multivendorx'),
			settingDescription: __(
				'Choose the primary AI service for product detail suggestions.',
				'multivendorx'
			),
			desc: __(
				'<ul><li>Gemini API - Powerful model from Google for general and creative tasks.<li>OpenAI API - Widely used models like GPT-4, requires an OpenAI API key.<li>OpenRouter API - Option to use another third-party generative AI service.</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'gemini_api',
					label: __('Gemini (Google)', 'multivendorx'),
					value: __('gemini_api', 'multivendorx'),
					icon: 'gemini',
				},
				{
					key: 'openai_api',
					label: __('OpenAI (ChatGPT)', 'multivendorx'),
					value: __('openai_api', 'multivendorx'),
					icon: 'chatgpt',
				},
				{
					key: 'openrouter_api',
					label: __('OpenRouter (Free/Open Models)', 'multivendorx'),
					value: __('openrouter_api', 'multivendorx'),
					icon: 'openrouter',
				},
			],
		},

		// --- OpenRouter API Key Section ---

		{
			key: 'openrouter_api_model',
			type: 'select',
			label: __('Open Router Model', 'multivendorx'),
			desc: __(
				'Choose your preferred AI model from OpenRouter.',
				'multivendorx'
			),
			dependent: {
				key: 'choose_ai_provider',
				set: true,
				value: 'openrouter_api',
			},

			options: [
				{
					key: 'openai/gpt-4o-mini',
					label: 'OpenAI GPT-4o Mini - Performance: Quick Output • Price: Budget-Friendly',
					value: 'openai/gpt-4o-mini',
				},
				{
					key: 'openai/gpt-5-mini',
					label: 'OpenAI GPT-5 Mini - Performance: Best-in-Class • Price: Premium',
					value: 'openai/gpt-5-mini',
				},
				{
					key: 'google/gemini-2.0-flash-exp:free',
					label: 'Google Gemini 2.0 Flash - Performance: Lightning Speed • Price: Low-Cost',
					value: 'google/gemini-2.0-flash-exp:free',
				},
			],
		},
		// --- Image Enhancement Provider ---
		{
			key: 'section',
			type: 'section',
			title: __('Image AI', 'multivendorx'),
			moduleEnabled: 'marketplace-intelligence',
			desc: __(
				'Product images can be enhanced automatically to look professional, improving visual appeal and customer engagement.',
				'multivendorx'
			),
		},
		{
			key: 'image_enhancement_provider',
			type: 'setting-toggle',
			label: __('Image Enhancement Provider', 'multivendorx'),
			desc: __(
				'Choose which AI provider to use for image enhancement.',
				'multivendorx'
			),
			settingDescription: __(
				'Select the AI service that will enhance and improve images across your marketplace.',
				'multivendorx'
			),

			options: [
				{
					key: 'gemini_api_image_enhancement',
					label: __('Gemini (Google)', 'multivendorx'),
					value: 'gemini_api',
					icon: 'gemini',
				},
				{
					key: 'openrouter_api_image_enhancement',
					label: __('OpenRouter (Free/Open Models)', 'multivendorx'),
					value: 'openrouter_api',
					icon: 'openrouter',
				},
			],
			defaultValue: 'gemini_api_image_enhancement',
		},
		// --- Gemini Image Enhancement Settings ---
		// {
		// 	key: 'gemini_api_image_enhancement_key',
		// 	type: 'text',
		// 	label: __('Gemini API Key for Image Enhancement', 'multivendorx'),
		// 	desc: __(
		// 		'<a href="https://ai.google.dev/gemini-api/docs/api-key" target="_blank">Click here to generate your Gemini API key.</a>',
		// 		'multivendorx'
		// 	),
		// 	dependent: {
		// 		key: 'image_enhancement_provider',
		// 		set: true,
		// 		value: 'gemini_api',
		// 	},
		// },
		// --- OpenRouter Image Enhancement Settings ---

		{
			key: 'openrouter_api_image_model',
			type: 'select',
			label: __('Gemini Model', 'multivendorx'),
			desc: __(
				'Choose your preferred AI model for image enhancement from OpenRouter.',
				'multivendorx'
			),
			dependent: {
				key: 'image_enhancement_provider',
				set: true,
				value: 'openrouter_api',
			},

			options: [
				{
					key: 'google/gemini-2.5-flash-image-preview',
					label: 'Google Gemini 2.5 Flash Image Preview',
					value: 'google/gemini-2.5-flash-image-preview',
				},
				{
					key: 'google/gemini-2.5-flash-image',
					label: 'Google Gemini 2.5 Flash Image',
					value: 'google/gemini-2.5-flash-image',
				},
				{
					key: 'google/gemini-3-pro-image-preview',
					label: 'Google Gemini 3 Pro Image Preview',
					value: 'google/gemini-3-pro-image-preview',
				},
			],
		},
	],
};
