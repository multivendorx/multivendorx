import { __ } from '@wordpress/i18n';
import {
	ColumnComponent,
	ContainerComponent,
	ModuleGuardComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';

/**
 * No 'ai-content' scanner category exists in FindingRepository/Dashboard.php
 * today (only seo/performance/security/accessibility/woocommerce/geo do) —
 * this is an honest "not built yet" placeholder rather than a page showing
 * fabricated AI-content-signal findings.
 */
const AIContent = () => (
	<>
		<NavigatorHeaderComponent
			headerIcon="ai"
			headerTitle={__('AI Content', 'vulopilot')}
			headerDescription={__(
				'The content signals AI assistants look for.',
				'vulopilot'
			)}
		/>
		<ContainerComponent general>
			<ColumnComponent>
				<ModuleGuardComponent
					icon="ai"
					title={__('Not scoring content signals yet', 'vulopilot')}
					desc={__(
						"A dedicated AI-content scanner category (summary blocks, Q&A structure, evidence, entity coverage) hasn't been built yet — flag if you want it scoped next.",
						'vulopilot'
					)}
				/>
			</ColumnComponent>
		</ContainerComponent>
	</>
);

export default AIContent;
