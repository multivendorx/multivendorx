/* global appLocalizer */
import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import type { ComponentType } from 'react';
import {
	CardComponent,
	ColumnComponent,
	ContainerComponent,
	NavigatorHeaderComponent,
	PopupComponent,
} from '@zyra/components';
import { ButtonInput } from '@zyra/inputs';
import FindingsTable from '../../components/FindingsTable';
import ShowProPopup from '../../components/Popup/Popup';
import LlmsTxtCard from './LlmsTxtCard';
import './GEO.scss';

/**
 * The per-post AI-scoring card (GEO-MODULE.md's "Generate GEO Score"/
 * "Generate AI suggestions") lives in vulopilot-pro/modules/GeoInsights —
 * a self-contained AI-scoring widget with no other Free consumer, unlike
 * the deterministic findings table below it (which stays Free, same
 * "health findings" shape every other category page already has). Same
 * "register a source, don't modify the host" pattern already used for
 * Reports' `vulopilot_reports_advanced_panel`. Shows a locked placeholder
 * (below, `GeoScoreLockedCard`) that opens the Pro popup on click when
 * Pro/GeoInsights isn't active, rather than rendering the full popup
 * content inline and unconditionally — same click-to-open pattern
 * AIAssistant.tsx's AiAnalyticsLockedCard/Automation.tsx already use.
 */
const GeoScoreCard = applyFilters(
	'vulopilot_geo_score_card',
	null
) as ComponentType | null;

/**
 * Visible teaser for the GEO score card above — shown instead of it when
 * `GeoScoreCard` isn't registered, so the feature is discoverable rather
 * than permanently occupying the page with the full upgrade pitch.
 */
const GeoScoreLockedCard = () => {
	const [isProPopupOpen, setIsProPopupOpen] = useState(false);

	return (
		<>
			<CardComponent
				title={__('GEO Score', 'vulopilot')}
				desc={__(
					'Score one post for AI-search-engine discoverability and get AI suggestions to improve it.',
					'vulopilot'
				)}
			>
				<ButtonInput
					buttons={{
						text: __('Unlock with Pro', 'vulopilot'),
						icon: 'lock',
						onClick: () => setIsProPopupOpen(true),
					}}
				/>
			</CardComponent>
			<PopupComponent
				open={isProPopupOpen}
				onClose={() => setIsProPopupOpen(false)}
				width={31.25}
				height="auto"
				position="lightbox"
			>
				{appLocalizer.active_modules.includes('geo-insights') ? (
					<ShowProPopup moduleName="geo-insights" />
				) : (
					<ShowProPopup />
				)}
			</PopupComponent>
		</>
	);
};

/**
 * GEO = Generative Engine Optimization — how discoverable/citable this
 * site is to AI answer engines (distinct from classic search-engine SEO).
 * Three complementary pieces: the per-post AI-generated score card (Pro),
 * the llms.txt generation/management card below it (Free, no AI cost),
 * and the sitewide findings table, populated by GEO-MODULE.md's 9
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
					{GeoScoreCard ? <GeoScoreCard /> : <GeoScoreLockedCard />}

					<LlmsTxtCard />

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
