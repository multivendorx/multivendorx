import { __ } from '@wordpress/i18n';
import FindingsTable from '../../components/FindingsTable';

const WooCommerce = () => (
	<FindingsTable
		title={__('WooCommerce', 'vulopilot')}
		description={__(
			'No WooCommerce findings yet — run a scan to check store settings, product data, and checkout health.',
			'vulopilot'
		)}
		category="woocommerce"
	/>
);

export default WooCommerce;
