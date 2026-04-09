import { __ } from '@wordpress/i18n';

export default {
	id: 'search-discovery',
	priority: 7,
	headerTitle: __('Search & Discovery', 'multivendorx'),
	headerDescription: __(
		'Enable stores to enhance their product visibility using advanced third-party SEO plugins.',
		'multivendorx'
	),
	headerIcon: 'search-discovery',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_seo_options',
			type: 'choice-toggle',
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
					requiredPlugin: 'wordpress-seo/wp-seo.php',
					pluginName: 'Yoast SEO', // human-friendly name
					pluginLink: 'https://wordpress.org/plugins/wordpress-seo/',
				},
				{
					key: 'rank_math',
					label: __('Rank Math', 'multivendorx'),
					value: 'rank_math',
					requiredPlugin: 'seo-by-rank-math/rank-math.php',
					pluginName: 'Rank Math SEO', // human-friendly name
					pluginLink:
						'https://wordpress.org/plugins/seo-by-rank-math/',
				},
			],
			moduleEnabled: 'search-discovery',
			proSetting: true,
		},
	],
};
