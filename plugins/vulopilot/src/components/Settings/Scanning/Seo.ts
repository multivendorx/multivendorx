import { __ } from '@wordpress/i18n';

/**
 * Granular, per-check toggles replacing the old whole-category
 * `enable_seo_scanning` switch — same "no blanket kill switch, only
 * granular ones" posture Scanning → GEO already uses. Each checkbox's
 * option key/value is the field's own settings key (not a shared
 * 'enabled' literal), matching every other settings tab in this plugin.
 *
 * Real backing per card:
 * - Titles & meta / Images / Links & schema: each toggle gates the one
 *   scanner it names directly (Scanners\Basic\MetaDescriptionScanner,
 *   DuplicateContentScanner, OrphanPageScanner, ThinContentScanner,
 *   SeoImagesScanner, ImagesScanner, BrokenLinksScanner, SchemaScanner +
 *   StructuredDataValidationScanner).
 * - XML Sitemap / Robots.txt: real toggles over WordPress core's own
 *   native sitemap (`/wp-sitemap.xml`, via Services\SitemapManager) and
 *   virtual robots.txt (via Services\RobotsTxtManager) — not a
 *   from-scratch generator for either.
 * - Redirects & 404s: persisted settings only — a real 301 redirect
 *   manager and a real 404-visit log (distinct from
 *   Scanners\Basic\NotFoundScanner, which only checks this site's OWN
 *   published permalinks for 404s, not visitor traffic) don't exist in
 *   this codebase yet. That's a separate, larger feature; these three
 *   toggles round-trip through Settings correctly but nothing reads them
 *   yet (Utill.php's own defaults list this same caveat).
 */
export default {
	id: 'seo',
	priority: 2,
	headerTitle: __('SEO', 'vulopilot'),
	headerIcon: 'search',
	submitUrl: 'settings',
	modal: [
		{
			key: 'seo-section-titles-meta',
			type: 'section',
			title: __('Titles & meta', 'vulopilot'),
			desc: __(
				'Controls what shows up in the SEO page\'s "Titles & Meta" and "Content Structure" findings.',
				'vulopilot'
			),
		},
		{
			key: 'flag_missing_meta_description',
			type: 'checkbox',
			look: 'toggle',
			label: __('Flag missing meta descriptions', 'vulopilot'),
			desc: __('Pages and posts with no meta description set.', 'vulopilot'),
			options: [
				{
					key: 'flag_missing_meta_description',
					label: '',
					value: 'flag_missing_meta_description',
				},
			],
		},
		{
			key: 'flag_duplicate_titles',
			type: 'checkbox',
			look: 'toggle',
			label: __('Flag duplicate title tags', 'vulopilot'),
			desc: __(
				'Two or more published pages sharing the exact same title.',
				'vulopilot'
			),
			options: [
				{ key: 'flag_duplicate_titles', label: '', value: 'flag_duplicate_titles' },
			],
		},
		{
			key: 'flag_orphan_pages',
			type: 'checkbox',
			look: 'toggle',
			label: __('Flag orphan pages', 'vulopilot'),
			desc: __('Pages with no internal links pointing to them.', 'vulopilot'),
			options: [
				{ key: 'flag_orphan_pages', label: '', value: 'flag_orphan_pages' },
			],
		},
		{
			key: 'thin_content_word_threshold',
			type: 'number',
			label: __('Thin content threshold (words)', 'vulopilot'),
			desc: __(
				'Pages below this word count are flagged as thin content.',
				'vulopilot'
			),
		},
		{
			key: 'seo-section-images',
			type: 'section',
			title: __('Images', 'vulopilot'),
			desc: __(
				'Controls the "Images" findings group on the SEO page.',
				'vulopilot'
			),
		},
		{
			key: 'flag_missing_featured_image',
			type: 'checkbox',
			look: 'toggle',
			label: __('Flag missing featured images', 'vulopilot'),
			desc: __(
				'Published pages, posts, or products with no featured image set.',
				'vulopilot'
			),
			options: [
				{
					key: 'flag_missing_featured_image',
					label: '',
					value: 'flag_missing_featured_image',
				},
			],
		},
		{
			key: 'flag_missing_alt_text',
			type: 'checkbox',
			look: 'toggle',
			label: __('Flag missing alt text', 'vulopilot'),
			desc: __('Content images with no alt attribute.', 'vulopilot'),
			options: [
				{ key: 'flag_missing_alt_text', label: '', value: 'flag_missing_alt_text' },
			],
		},
		{
			key: 'seo-section-links-schema',
			type: 'section',
			title: __('Links & schema', 'vulopilot'),
			desc: __(
				'Controls the "Links & Indexability" and "Schema" findings groups.',
				'vulopilot'
			),
		},
		{
			key: 'flag_broken_links',
			type: 'checkbox',
			look: 'toggle',
			label: __('Flag broken internal links', 'vulopilot'),
			desc: __(
				'Internal links pointing to a 404 or removed page.',
				'vulopilot'
			),
			options: [
				{ key: 'flag_broken_links', label: '', value: 'flag_broken_links' },
			],
		},
		{
			key: 'broken_link_check_frequency',
			type: 'select',
			label: __('Broken link check frequency', 'vulopilot'),
			desc: __(
				'How often this specific check re-runs, independent of the overall scan frequency in the General tab.',
				'vulopilot'
			),
			options: [
				{ label: __('Daily', 'vulopilot'), value: 'daily' },
				{ label: __('Weekly', 'vulopilot'), value: 'weekly' },
			],
			dependent: { key: 'flag_broken_links', value: 'flag_broken_links', set: true },
		},
		{
			key: 'flag_missing_schema',
			type: 'checkbox',
			look: 'toggle',
			label: __('Flag missing structured data', 'vulopilot'),
			desc: __(
				'Content types (FAQ, Review, HowTo, etc.) without valid schema markup.',
				'vulopilot'
			),
			options: [
				{ key: 'flag_missing_schema', label: '', value: 'flag_missing_schema' },
			],
		},
		{
			key: 'seo-section-sitemap',
			type: 'section',
			title: __('XML Sitemap', 'vulopilot'),
		},
		{
			key: 'sitemap_enabled',
			type: 'checkbox',
			look: 'toggle',
			label: __('Generate XML sitemap', 'vulopilot'),
			desc: __(
				'Available at yoursite.com/wp-sitemap.xml once enabled.',
				'vulopilot'
			),
			options: [
				{ key: 'sitemap_enabled', label: '', value: 'sitemap_enabled' },
			],
		},
		{
			key: 'sitemap_ping_search_engines',
			type: 'checkbox',
			look: 'toggle',
			label: __('Ping search engines on update', 'vulopilot'),
			desc: __(
				'Notifies Bing automatically when new content is published.',
				'vulopilot'
			),
			options: [
				{
					key: 'sitemap_ping_search_engines',
					label: '',
					value: 'sitemap_ping_search_engines',
				},
			],
			dependent: { key: 'sitemap_enabled', value: 'sitemap_enabled', set: true },
		},
		{
			key: 'seo-section-robots',
			type: 'section',
			title: __('Robots.txt', 'vulopilot'),
		},
		{
			key: 'robots_auto_generate',
			type: 'checkbox',
			look: 'toggle',
			label: __('Auto-generate robots.txt', 'vulopilot'),
			desc: __(
				'Adds a sitemap reference to your robots.txt. Turn off if you maintain a custom robots.txt file yourself.',
				'vulopilot'
			),
			options: [
				{ key: 'robots_auto_generate', label: '', value: 'robots_auto_generate' },
			],
		},
		{
			key: 'seo-section-redirects',
			type: 'section',
			title: __('Redirects & 404s', 'vulopilot'),
		},
		{
			key: 'enable_redirect_manager',
			type: 'checkbox',
			look: 'toggle',
			label: __('Enable redirect manager', 'vulopilot'),
			desc: __(
				'Create and manage 301 redirects from the Redirects page.',
				'vulopilot'
			),
			options: [
				{
					key: 'enable_redirect_manager',
					label: '',
					value: 'enable_redirect_manager',
				},
			],
		},
		{
			key: 'auto_redirect_on_slug_change',
			type: 'checkbox',
			look: 'toggle',
			label: __('Auto-create redirect on slug change', 'vulopilot'),
			desc: __(
				'When a published page or post URL changes, redirect the old URL automatically.',
				'vulopilot'
			),
			options: [
				{
					key: 'auto_redirect_on_slug_change',
					label: '',
					value: 'auto_redirect_on_slug_change',
				},
			],
			dependent: {
				key: 'enable_redirect_manager',
				value: 'enable_redirect_manager',
				set: true,
			},
		},
		{
			key: 'log_404s',
			type: 'checkbox',
			look: 'toggle',
			label: __('Log 404s', 'vulopilot'),
			desc: __(
				'Track visits to missing pages so you can turn them into redirect suggestions.',
				'vulopilot'
			),
			options: [{ key: 'log_404s', label: '', value: 'log_404s' }],
		},
	],
};
