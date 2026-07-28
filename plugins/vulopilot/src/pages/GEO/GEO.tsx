import { __ } from '@wordpress/i18n';
import {
	ColumnComponent,
	ContainerComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import FindingsTable from '../../components/FindingsTable';
import './GEO.scss';

/**
 * GEO = Generative Engine Optimization — how discoverable/citable this
 * site is to AI answer engines (distinct from classic search-engine SEO).
 * Same header + findings-table shape every other category page (SEO,
 * Performance, Accessibility, WooCommerce, Security) already uses — the
 * per-post AI-scoring card and the llms.txt management card that used to
 * sit above this table were moved out: llms.txt's toggle/preview/live-link
 * now live under Settings → GEO (Scanning/Geo.ts + LlmsTxtCard.tsx), and
 * the Pro per-post AI-scoring slot (`vulopilot_geo_score_card`) no longer
 * has a render call on this page.
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
				<FindingsTable
					title={__('GEO findings', 'vulopilot')}
					description={__(
						'No GEO findings yet — run a scan to check how AI answer engines can discover and cite this site.',
						'vulopilot'
					)}
					category="geo"
				/>
			</ColumnComponent>
		</ContainerComponent>
	</>
);

export default GEO;
