import { __ } from '@wordpress/i18n';

export default {
	id: 'seo',
	priority: 7,
	name: __('SEO', 'multivendorx'),
	desc: __(
		'Enable stores to enhance their product visibility using advanced third-party SEO plugins.',
		'multivendorx'
	),
	icon: 'adminfont-store-seo',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_seo_options',
			type: 'setting-toggle',
			label: __('Third-party SEO tools', 'multivendorx'),
			settingDescription: __(
				'Let stores manage SEO and boost their visibility using advanced plugins.',
				'multivendorx'
			),
			desc: __(
				'Stores are enabled to professionally optimize product titles, meta descriptions, keywords, rich snippets, and other SEO features through this advanced, third-party supported SEO integration using Yoast SEO or Rank Math.',
				'multivendorx'
			),
			options: [
				{
					key: 'yoast',
					label: __('Yoast', 'multivendorx'),
					value: 'yoast',
				},
				{
					key: 'rank_math',
					label: __('Rank Math', 'multivendorx'),
					value: 'rank_math',
				},
			],
			moduleEnabled: 'store-seo',
			proSetting: true,
		},
	],
};
