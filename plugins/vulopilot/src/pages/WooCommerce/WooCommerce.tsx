import { __ } from '@wordpress/i18n';
import {
	ColumnComponent,
	ContainerComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import FindingsTable from '../../components/FindingsTable';

const WooCommerce = () => (
	<>
		<NavigatorHeaderComponent
			headerIcon="woocommerce"
			headerTitle={__('WooCommerce', 'vulopilot')}
			headerDescription={__(
				'Store settings, product data, and checkout health findings.',
				'vulopilot'
			)}
		/>
		<ContainerComponent general>
			<ColumnComponent>
				<FindingsTable
					title={__('WooCommerce', 'vulopilot')}
					description={__(
						'No WooCommerce findings yet — run a scan to check store settings, product data, and checkout health.',
						'vulopilot'
					)}
					category="woocommerce"
				/>
			</ColumnComponent>
		</ContainerComponent>
	</>
);

export default WooCommerce;
