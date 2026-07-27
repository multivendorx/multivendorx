import { __ } from '@wordpress/i18n';
import {
	ColumnComponent,
	ContainerComponent,
	ModuleGuardComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';

/**
 * No 'content' scanner category exists yet — an honest placeholder, same
 * reasoning as AIContent.tsx/Schema.tsx.
 */
const Content = () => (
	<>
		<NavigatorHeaderComponent
			headerIcon="report"
			headerTitle={__('Content', 'vulopilot')}
			headerDescription={__(
				'Depth, originality, and readability across pages and posts.',
				'vulopilot'
			)}
		/>
		<ContainerComponent general>
			<ColumnComponent>
				<ModuleGuardComponent
					icon="report"
					title={__('Not scoring content quality yet', 'vulopilot')}
					desc={__(
						"A dedicated content-quality scanner category (thin content, duplicate content, heading structure) hasn't been built yet — flag if you want it scoped next.",
						'vulopilot'
					)}
				/>
			</ColumnComponent>
		</ContainerComponent>
	</>
);

export default Content;
