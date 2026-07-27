import { __ } from '@wordpress/i18n';
import {
	CardComponent,
	ColumnComponent,
	ContainerComponent,
	ModuleGuardComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';

/**
 * readme.txt's Brand Visibility & Share of Voice feature depends on an
 * Ahrefs Brand Radar connection that isn't implemented yet (no
 * VuloPilot\Connections\Ahrefs class, no REST controller, no settings
 * field for an API key) — this page says so honestly rather than
 * rendering charts built from fabricated numbers, matching the same
 * "not connected" empty state ModuleGuardComponent already renders
 * elsewhere in this plugin (PendingApprovalWidget, HealthTimelineWidget).
 */
const BrandVisibility = () => (
	<>
		<NavigatorHeaderComponent
			headerIcon="globe"
			headerTitle={__('Brand Visibility', 'vulopilot')}
			headerDescription={__(
				'Off-site brand mentions, citations, and share of voice.',
				'vulopilot'
			)}
		/>
		<ContainerComponent general>
			<ColumnComponent>
				<CardComponent
					className="brand-visibility-why-card"
					title={__(
						'Why this matters more than backlinks',
						'vulopilot'
					)}
				>
					<p>
						{__(
							'Branded web mentions correlate with AI citation roughly 3x more strongly than backlinks. AI engines look for consensus across third-party sources, not just links pointing at your site.',
							'vulopilot'
						)}
					</p>
				</CardComponent>
			</ColumnComponent>
			<ColumnComponent>
				<ModuleGuardComponent
					icon="lock"
					title={__('Not connected yet', 'vulopilot')}
					desc={__(
						'Connect an Ahrefs Brand Radar account from Settings to start tracking real mentions, share of voice, and citing domains here.',
						'vulopilot'
					)}
				/>
			</ColumnComponent>
		</ContainerComponent>
	</>
);

export default BrandVisibility;
