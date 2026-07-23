import { __ } from '@wordpress/i18n';
import FindingsTable from '../../components/FindingsTable';
import GeoScoreCard from './GeoScoreCard';
import './GEO.scss';

/**
 * GEO = Generative Engine Optimization — how discoverable/citable this
 * site is to AI answer engines (distinct from classic search-engine SEO).
 * Two complementary views: GeoScoreCard's per-post AI-generated score
 * (GEO-MODULE.md's "Generate GEO Score"/"Generate AI suggestions"), and
 * the sitewide findings table below it, now populated by GEO-MODULE.md's
 * 8 deterministic scanners — this page showed only its empty state
 * before that pass existed (SCANNERS.md's original note on this page).
 */
const GEO = () => (
	<div className="vulopilot-geo-page">
		<GeoScoreCard />

		<FindingsTable
			title={__('GEO findings', 'vulopilot')}
			description={__(
				'No GEO findings yet — run a scan to check how AI answer engines can discover and cite this site.',
				'vulopilot'
			)}
			category="geo"
		/>
	</div>
);

export default GEO;
