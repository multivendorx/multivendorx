import { __ } from '@wordpress/i18n';
import {
	ColumnComponent,
	ContainerComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import FindingsTable from '../../components/FindingsTable';

const Performance = () => (
	<>
		<NavigatorHeaderComponent
			headerIcon="performance"
			headerTitle={__('Performance', 'vulopilot')}
			headerDescription={__(
				'Caching, heavy plugins, large images, and slow-page findings.',
				'vulopilot'
			)}
		/>
		<ContainerComponent general>
			<ColumnComponent>
				<FindingsTable
					title={__('Performance', 'vulopilot')}
					description={__(
						'No performance findings yet — run a scan to check caching, heavy plugins, large images, and slow pages.',
						'vulopilot'
					)}
					category="performance"
				/>
			</ColumnComponent>
		</ContainerComponent>
	</>
);

export default Performance;
