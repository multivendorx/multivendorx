/* global appLocalizer */
import { __ } from '@wordpress/i18n';
import {
	CardComponent,
	ColumnComponent,
	ContainerComponent,
	ModuleGuardComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import { ButtonInput } from '@zyra/inputs';
import FindingsTable from '../../components/FindingsTable';

/**
 * Section → scanner_id grouping, mirroring the 6 cards Settings → Scanning →
 * SEO already presents these same checks under (src/components/Settings/
 * Scanning/Seo.ts) so the findings page and its settings page agree on what
 * "Titles & meta"/"Images"/etc. actually cover. Each section renders as its
 * own independent FindingsTable/TableCard — its own fetch, its own status
 * pill bar, its own pagination/search/sort/bulk actions — rather than one
 * combined table filtered only to category="seo" (SEO-MODULE.md's 15+2
 * scanners used to all land in a single flat table here).
 *
 * Deliberately no `category` prop passed to FindingsTable below — these 17
 * scanners don't all share one `category` column value (ImagesScanner is
 * "images", SchemaScanner is "schema", BrokenLinksScanner is "links"; only
 * the other 14 are actually "seo" — modules/Seo/Module.php's own docblock
 * has the full breakdown). Filtering by scanner_id alone is both necessary
 * (a `category="seo"` filter would silently exclude the images/schema/links
 * ones, since the backend ANDs both) and sufficient (scanner_id already
 * uniquely determines which section a finding belongs to).
 *
 * A new SEO scanner's findings won't show up on this page at all until it's
 * added both to modules/Seo/Module.php's registration list AND to the right
 * section below (see SEO-MODULE.md's own note on this).
 */
const SEO_SECTIONS: {
	key: string;
	title: string;
	description: string;
	emptyMessage: string;
	scannerIds: string[];
}[] = [
	{
		key: 'titles-meta',
		title: __('Titles & meta', 'vulopilot'),
		description: __(
			'Title length, meta descriptions, canonicals, duplicate titles, orphan pages, thin content, and heading structure.',
			'vulopilot'
		),
		emptyMessage: __(
			'No titles/meta findings yet — run a scan to check titles, descriptions, and content structure.',
			'vulopilot'
		),
		scannerIds: [
			'seo',
			'meta-description',
			'canonical-url',
			'duplicate-content',
			'orphan-pages',
			'thin-content',
			'heading-structure',
		],
	},
	{
		key: 'images',
		title: __('Images', 'vulopilot'),
		description: __(
			'Missing featured images and content images with no alt text.',
			'vulopilot'
		),
		emptyMessage: __(
			'No image findings yet — run a scan to check featured images and alt text.',
			'vulopilot'
		),
		scannerIds: ['seo-images', 'images'],
	},
	{
		key: 'links-schema',
		title: __('Links & schema', 'vulopilot'),
		description: __(
			'Internal links, broken links, structured data, and social preview tags.',
			'vulopilot'
		),
		emptyMessage: __(
			'No link/schema findings yet — run a scan to check internal links and structured data.',
			'vulopilot'
		),
		scannerIds: [
			'internal-linking',
			'broken-links',
			'schema',
			'structured-data',
			'sitewide-structured-data',
			'open-graph',
			'twitter-card',
		],
	},
	{
		key: 'sitemap',
		title: __('XML Sitemap', 'vulopilot'),
		description: __(
			'Whether /wp-sitemap.xml is reachable and valid.',
			'vulopilot'
		),
		emptyMessage: __(
			'No sitemap findings yet — run a scan to check your XML sitemap.',
			'vulopilot'
		),
		scannerIds: ['sitemap', 'sitemap-validation'],
	},
	{
		key: 'robots',
		title: __('Robots.txt', 'vulopilot'),
		description: __(
			'Whether robots.txt is reachable and not accidentally blocking every crawler.',
			'vulopilot'
		),
		emptyMessage: __(
			'No robots.txt findings yet — run a scan to check crawler access.',
			'vulopilot'
		),
		scannerIds: ['robots-txt'],
	},
];

/**
 * Unlike the 'geo' module (whose own scanners run regardless of its
 * active-module state — see modules/Geo/Module.php's docblock), 'seo'
 * genuinely gates scanning (modules/Seo/Module.php): if it's off, none of
 * the 17 SEO scanner classes get registered, so every section table below
 * would silently sit empty forever with no explanation. This page is the
 * one place in Free that actually checks `appLocalizer.active_modules` to
 * tell a site owner why, rather than leaving them staring at "no findings
 * yet — run a scan" when a scan running wouldn't help.
 */
const isSeoModuleActive = () =>
	appLocalizer.active_modules?.includes('seo') ?? false;

const SEO = () => (
	<>
		<NavigatorHeaderComponent
			headerIcon="search"
			headerTitle={__('SEO', 'vulopilot')}
			headerDescription={__(
				'Titles, meta descriptions, and indexability findings, grouped the same way as Settings → Scanning → SEO.',
				'vulopilot'
			)}
		/>
		<ContainerComponent general>
			<ColumnComponent>
				{!isSeoModuleActive() ? (
					<CardComponent title={__('SEO', 'vulopilot')}>
						<ModuleGuardComponent
							icon="warning"
							title={__('SEO module is turned off', 'vulopilot')}
							desc={__(
								'Turn the SEO module back on from Settings → Modules to resume SEO scanning and see its findings again here. Findings already found before it was turned off aren’t deleted — they still show up on the Health page, which lists every category.',
								'vulopilot'
							)}
						/>
					</CardComponent>
				) : (
					<>
						{SEO_SECTIONS.map((section) => (
							<CardComponent
								key={section.key}
								title={section.title}
								desc={section.description}
							>
								<FindingsTable
									title={section.title}
									description={section.emptyMessage}
									scannerIds={section.scannerIds}
								/>
							</CardComponent>
						))}
						{/* The redirect manager/404 log themselves (Settings →
						    Scanning → SEO's three toggles) now have a real,
						    dedicated page — this card is a pointer to it
						    plus a home for RedirectAnalysisScanner's own
						    findings (category 'redirects', a homepage
						    redirect-chain health check that predates this
						    page and had nowhere in the UI to appear until
						    now — see that scanner's own docblock). */}
						<CardComponent
							title={__('Redirects & 404s', 'vulopilot')}
							desc={__(
								'301 redirects and 404 traffic logging.',
								'vulopilot'
							)}
							action={
								<ButtonInput
									buttons={{
										text: __(
											'Manage redirects →',
											'vulopilot'
										),
										onClick: () => {
											window.open(
												`${appLocalizer.admin_url}#&tab=redirects`,
												'_self'
											);
										},
									}}
								/>
							}
						>
							<FindingsTable
								title={__('Redirect health', 'vulopilot')}
								description={__(
									'No redirect-chain issues found — run a scan to check the homepage for long or looping redirects.',
									'vulopilot'
								)}
								scannerIds={['redirect-analysis']}
							/>
						</CardComponent>
					</>
				)}
			</ColumnComponent>
		</ContainerComponent>
	</>
);

export default SEO;
