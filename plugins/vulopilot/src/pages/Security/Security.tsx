import { __ } from '@wordpress/i18n';
import {
	ColumnComponent,
	ContainerComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import FindingsTable from '../../components/FindingsTable';

/**
 * Same shape as SEO/Performance/Accessibility/WooCommerce — `category`
 * scanner findings already exist for 'security' (Dashboard.php's
 * category_scores includes it, and vulopilot-pro's SecurityMonitoring
 * module writes findings under this category), it just never had its own
 * top-level page before; Health's unfiltered findings list was the only
 * place they surfaced.
 */
const Security = () => (
	<>
		<NavigatorHeaderComponent
			headerIcon="security"
			headerTitle={__('Security', 'vulopilot')}
			headerDescription={__(
				'Site hardening and exposure checks.',
				'vulopilot'
			)}
		/>
		<ContainerComponent general>
			<ColumnComponent>
				<FindingsTable
					title={__('Security', 'vulopilot')}
					description={__(
						'No security findings yet — run a scan to check for hardening and exposure issues.',
						'vulopilot'
					)}
					category="security"
				/>
			</ColumnComponent>
		</ContainerComponent>
	</>
);

export default Security;
