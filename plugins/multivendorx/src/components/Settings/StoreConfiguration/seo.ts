import { __ } from '@wordpress/i18n';

export default {
	id: 'seo',
	priority: 7,
	name: __('SEO', 'mvx-pro'),
	desc: __(
		'Enable stores to enhance their product visibility using advanced third-party SEO plugins.',
		'mvx-pro'
	),
	icon: 'adminfont-store-seo',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_seo_options',
			type: 'setting-toggle',
			label: __('Third-party SEO tools', 'mvx-pro'),
			settingDescription: __(
				'Let stores manage SEO and boost their visibility using advanced plugins.',
				'multivendorx'
			),
			desc: __(
				'Stores are enabled to professionally optimize product titles, meta descriptions, keywords, rich snippets, and other SEO features through this advanced, third-party supported SEO integration using Yoast SEO or Rank Math.',
				'mvx-pro'
			),
			options: [
				{
					key: 'yoast',
					label: __('Yoast', 'mvx-pro'),
					value: 'yoast',
				},
				{
					key: 'rank_math',
					label: __('Rank Math', 'mvx-pro'),
					value: 'rank_math',
				},
			],
			moduleEnabled: 'store-seo',
			proSetting: true,
		},
	],
};
