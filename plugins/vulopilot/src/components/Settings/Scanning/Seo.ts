import { __ } from '@wordpress/i18n';

export default {
	id: 'seo',
	priority: 2,
	headerTitle: __('SEO', 'vulopilot'),
	headerIcon: 'search',
	submitUrl: 'settings',
	modal: [
		{
			key: 'enable_seo_scanning',
			type: 'checkbox',
			look: 'toggle',
			label: __('Enable SEO scanning', 'vulopilot'),
			desc: __(
				'Turns every category "seo" scanner on or off (titles, meta descriptions, canonical URLs, internal linking, headings, thin content, duplicate content, sitemap, robots.txt, Open Graph, Twitter Card, orphan pages, image alt text, structured data).',
				'vulopilot'
			),
			options: [
				{ key: 'enabled', label: '', value: 'enabled' },
			],
		},
	],
};
