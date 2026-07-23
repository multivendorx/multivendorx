import { __ } from '@wordpress/i18n';
import {
	ColumnComponent,
	ContainerComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import FindingsTable from '../../components/FindingsTable';

/**
 * Every finding across every scanner category — the SEO/GEO/WooCommerce
 * pages are this same view pre-filtered to one category.
 *
 * Wrapped in the same NavigatorHeaderComponent + ContainerComponent +
 * ColumnComponent shape every real multivendorx admin tab page uses
 * (e.g. components/Commissions/Commissions.tsx) — a bare `<FindingsTable>`
 * with no container renders with none of the page padding/title-bar
 * styling those two components provide, which is what made this page
 * (and every other page below it) look broken rather than an actual
 * data/functionality bug.
 */
const Health = () => (
	<>
		<NavigatorHeaderComponent
			headerIcon="home"
			headerTitle={__('Site health', 'vulopilot')}
			headerDescription={__(
				'Every open finding across every scanner category.',
				'vulopilot'
			)}
		/>
		<ContainerComponent general>
			<ColumnComponent>
				<FindingsTable
					title={__('Site health', 'vulopilot')}
					description={__(
						'No open findings — your site is looking healthy.',
						'vulopilot'
					)}
				/>
			</ColumnComponent>
		</ContainerComponent>
	</>
);

export default Health;
