import { __ } from '@wordpress/i18n';
import {
	ColumnComponent,
	ContainerComponent,
	ModuleGuardComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';

/**
 * No 'schema' scanner category exists yet as its own dimension — SEO's
 * own findings already cover schema markup checks (Schema: Organization/
 * Product/FAQPage/etc rows) rather than a fully separate scanner set, so
 * this points there instead of duplicating the same checks under a
 * second, currently-empty category.
 */
const Schema = () => (
	<>
		<NavigatorHeaderComponent
			headerIcon="check"
			headerTitle={__('Schema', 'vulopilot')}
			headerDescription={__(
				'Structured data coverage across your content types.',
				'vulopilot'
			)}
		/>
		<ContainerComponent general>
			<ColumnComponent>
				<ModuleGuardComponent
					icon="check"
					title={__(
						'Schema checks currently live under SEO',
						'vulopilot'
					)}
					desc={__(
						"There's no separate schema scanner category yet — open the SEO page to see structured-data findings today, or flag if a dedicated Schema category should be scoped next.",
						'vulopilot'
					)}
				/>
			</ColumnComponent>
		</ContainerComponent>
	</>
);

export default Schema;
