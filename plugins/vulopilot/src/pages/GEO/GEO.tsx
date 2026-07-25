import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import type { ComponentType } from 'react';
import {
	ColumnComponent,
	ContainerComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import FindingsTable from '../../components/FindingsTable';
import ShowProPopup from '../../components/Popup/Popup';
import './GEO.scss';

/**
 * The per-post AI-scoring card (GEO-MODULE.md's "Generate GEO Score"/
 * "Generate AI suggestions") lives in vulopilot-pro/modules/GeoInsights —
 * a self-contained AI-scoring widget with no other Free consumer, unlike
 * the deterministic findings table below it (which stays Free, same
 * "health findings" shape every other category page already has). Same
 * "register a source, don't modify the host" pattern already used for
 * Reports' `vulopilot_reports_advanced_panel`. Generic upgrade pitch (no
 * `moduleName`) when absent — GeoInsights is a new-enough module that a
 * "which module to enable" popup would be less honest than the plain
 * upgrade pitch for most Free users.
 */
const GeoScoreCard = applyFilters(
	'vulopilot_geo_score_card',
	null
) as ComponentType | null;

/**
 * GEO = Generative Engine Optimization — how discoverable/citable this
 * site is to AI answer engines (distinct from classic search-engine SEO).
 * Two complementary views: the per-post AI-generated score card (Pro), and
 * the sitewide findings table below it, populated by GEO-MODULE.md's 8
 * deterministic scanners (Free).
 */
const GEO = () => (
	<>
		<NavigatorHeaderComponent
			headerIcon="globe"
			headerTitle={__('GEO', 'vulopilot')}
			headerDescription={__(
				'Generative Engine Optimization — how discoverable and citable this site is to AI answer engines.',
				'vulopilot'
			)}
		/>
		<ContainerComponent general>
			<ColumnComponent>
				<div className="vulopilot-geo-page">
					{GeoScoreCard ? <GeoScoreCard /> : <ShowProPopup />}

					<FindingsTable
						title={__('GEO findings', 'vulopilot')}
						description={__(
							'No GEO findings yet — run a scan to check how AI answer engines can discover and cite this site.',
							'vulopilot'
						)}
						category="geo"
					/>
				</div>
			</ColumnComponent>
		</ContainerComponent>
	</>
);

export default GEO;
