import { __ } from '@wordpress/i18n';
import {
	ColumnComponent,
	ContainerComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import FindingsTable from '../../components/FindingsTable';

const SEO = () => (
	<>
		<NavigatorHeaderComponent
			headerIcon="search"
			headerTitle={__('SEO', 'vulopilot')}
			headerDescription={__(
				'Titles, meta descriptions, and indexability findings.',
				'vulopilot'
			)}
		/>
		<ContainerComponent general>
			<ColumnComponent>
				<FindingsTable
					title={__('SEO', 'vulopilot')}
					description={__(
						'No SEO findings yet — run a scan to check titles, meta descriptions, and indexability.',
						'vulopilot'
					)}
					category="seo"
				/>
			</ColumnComponent>
		</ContainerComponent>
	</>
);

export default SEO;
