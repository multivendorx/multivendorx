import { __ } from '@wordpress/i18n';

export default {
	id: 'geo',
	priority: 3,
	headerTitle: __('GEO', 'vulopilot'),
	headerIcon: 'globe',
	submitUrl: 'settings',
	modal: [
		{
			key: 'geo-section-llms-txt',
			type: 'section',
			title: __('llms.txt', 'vulopilot'),
			desc: __(
				'A Markdown index of your key pages, served at /llms.txt for AI systems to read instead of crawling your whole site.',
				'vulopilot'
			),
		},
		{
			key: 'enable_llms_txt',
			type: 'checkbox',
			look: 'toggle',
			label: __('Generate llms.txt', 'vulopilot'),
			desc: __(
				"Available at your site's /llms.txt once enabled.",
				'vulopilot'
			),
			options: [
				{ key: 'enable_llms_txt', label: '', value: 'enable_llms_txt' },
			],
		},
		{
			key: 'llms_auto_regen',
			type: 'checkbox',
			look: 'toggle',
			label: __('Auto-regenerate on publish', 'vulopilot'),
			desc: __(
				'Rebuild llms.txt whenever a page, post, or product is published or updated — requires the GEO module (Modules page) to be active.',
				'vulopilot'
			),
			options: [
				{ key: 'llms_auto_regen', label: '', value: 'llms_auto_regen' },
			],
			dependent: { key: 'enable_llms_txt', value: 'enable_llms_txt', set: true },
		},
		{
			key: 'llms_include_types',
			type: 'checkbox',
			label: __('Included content types', 'vulopilot'),
			desc: __(
				'Which content types are listed in llms.txt.',
				'vulopilot'
			),
			options: [
				{ key: 'pages', label: __('Pages', 'vulopilot'), value: 'pages' },
				{ key: 'posts', label: __('Posts', 'vulopilot'), value: 'posts' },
				{ key: 'products', label: __('Products', 'vulopilot'), value: 'products' },
			],
			dependent: { key: 'enable_llms_txt', value: 'enable_llms_txt', set: true },
		},
		{
			key: 'llms_txt_content',
			type: 'textarea',
			label: __('llms.txt content', 'vulopilot'),
			desc: __(
				'Pre-filled with an auto-generated index of your published pages and posts — edit and it saves automatically, just like every other setting here, and is written straight to the live /llms.txt file.',
				'vulopilot'
			),
			dependent: { key: 'enable_llms_txt', value: 'enable_llms_txt', set: true },
		},
		{
			key: 'geo-section-ai-summary',
			type: 'section',
			title: __('AI summary & answer structure', 'vulopilot'),
		},
		{
			key: 'flag_missing_ai_summary',
			type: 'checkbox',
			look: 'toggle',
			label: __('Flag pages missing an AI summary block', 'vulopilot'),
			desc: __(
				'Pages with no clear, extractable answer near the top of the content.',
				'vulopilot'
			),
			options: [
				{ key: 'flag_missing_ai_summary', label: '', value: 'flag_missing_ai_summary' },
			],
		},
		{
			key: 'answer_first_words',
			type: 'number',
			label: __('Answer-first threshold (words)', 'vulopilot'),
			desc: __(
				"Flag a page if its core answer doesn't appear within this many words from the top.",
				'vulopilot'
			),
			dependent: { key: 'flag_missing_ai_summary', value: 'flag_missing_ai_summary', set: true },
		},
		{
			key: 'geo-section-evidence',
			type: 'section',
			title: __('Evidence & freshness', 'vulopilot'),
		},
		{
			key: 'min_data_points',
			type: 'number',
			label: __('Minimum data points per 500 words', 'vulopilot'),
			desc: __(
				"Pages with fewer stats, numbers, or cited facts than this score lower on the GEO AI score's Data Point & Evidence Density (Pro).",
				'vulopilot'
			),
		},
		{
			key: 'stale_content_months',
			type: 'number',
			label: __('Flag content older than (months)', 'vulopilot'),
			desc: __(
				"Pages not updated within this window score lower on the GEO AI score's Content Freshness (Pro).",
				'vulopilot'
			),
		},
		{
			key: 'geo-section-alerts',
			type: 'section',
			title: __('Alerts', 'vulopilot'),
		},
		{
			key: 'geo_drop_threshold',
			type: 'number',
			label: __('GEO score drop alert threshold (points)', 'vulopilot'),
			desc: __(
				'Used by the "Email me when GEO score drops" notification in the Notifications tab.',
				'vulopilot'
			),
		},
	],
};
