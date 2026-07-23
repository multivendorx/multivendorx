import { __ } from '@wordpress/i18n';
import FindingsTable from '../../components/FindingsTable';

const SEO = () => (
	<FindingsTable
		title={__('SEO', 'vulopilot')}
		description={__(
			'No SEO findings yet — run a scan to check titles, meta descriptions, and indexability.',
			'vulopilot'
		)}
		category="seo"
	/>
);

export default SEO;
