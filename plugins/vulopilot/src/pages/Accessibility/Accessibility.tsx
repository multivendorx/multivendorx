import { __ } from '@wordpress/i18n';
import {
	ColumnComponent,
	ContainerComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import FindingsTable from '../../components/FindingsTable';

const Accessibility = () => (
	<>
		<NavigatorHeaderComponent
			headerIcon="universal-access-alt"
			headerTitle={__('Accessibility', 'vulopilot')}
			headerDescription={__(
				'Heading structure, ARIA attributes, and form label findings.',
				'vulopilot'
			)}
		/>
		<ContainerComponent general>
			<ColumnComponent>
				<FindingsTable
					title={__('Accessibility', 'vulopilot')}
					description={__(
						'No accessibility findings yet — run a scan to check heading structure, ARIA attributes, and form labels.',
						'vulopilot'
					)}
					category="accessibility"
				/>
			</ColumnComponent>
		</ContainerComponent>
	</>
);

export default Accessibility;
