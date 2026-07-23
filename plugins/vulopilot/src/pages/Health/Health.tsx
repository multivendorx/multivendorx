import { __ } from '@wordpress/i18n';
import FindingsTable from '../../components/FindingsTable';

/**
 * Every finding across every scanner category — the SEO/GEO/WooCommerce
 * pages are this same view pre-filtered to one category.
 */
const Health = () => (
	<FindingsTable
		title={__('Site health', 'vulopilot')}
		description={__(
			'No open findings — your site is looking healthy.',
			'vulopilot'
		)}
	/>
);

export default Health;
