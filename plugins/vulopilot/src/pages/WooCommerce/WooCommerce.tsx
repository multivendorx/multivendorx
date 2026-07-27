/* global appLocalizer */
import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import type { ComponentType } from 'react';
import {
	CardComponent,
	ColumnComponent,
	ContainerComponent,
	NavigatorHeaderComponent,
	PopupComponent,
} from '@zyra/components';
import { ButtonInput } from '@zyra/inputs';
import FindingsTable from '../../components/FindingsTable';
import ShowProPopup from '../../components/Popup/Popup';

/**
 * Slot for vulopilot-pro's WooCommerceAi module — "AI Blog Generation" and
 * "Bulk AI Optimization" (readme.txt) are Pro business logic, so their
 * management UI is injected here rather than built into Free's own
 * bundle. Shows a locked placeholder (below, `WooCommerceAiLockedCard`)
 * that opens the Pro popup on click when Pro/WooCommerceAi isn't active,
 * rather than rendering nothing — same click-to-open pattern
 * AIAssistant.tsx's AiAnalyticsLockedCard/Automation.tsx already use,
 * consistent across every Pro-gated panel slot in this plugin.
 */
const WooCommerceAiPanel = applyFilters(
	'vulopilot_woocommerce_ai_panel',
	null
) as ComponentType | null;

/**
 * Visible teaser for the bulk-optimize panel above — shown instead of it
 * when `WooCommerceAiPanel` isn't registered, so the feature is
 * discoverable rather than simply absent.
 */
const WooCommerceAiLockedCard = () => {
	const [isProPopupOpen, setIsProPopupOpen] = useState(false);

	return (
		<>
			<CardComponent
				title={__('Bulk AI optimization', 'vulopilot')}
				desc={__(
					'Rewrite titles, generate descriptions/FAQ/schema, and suggest cross-sell/upsell/bundles across a batch of products at once.',
					'vulopilot'
				)}
			>
				<ButtonInput
					buttons={{
						text: __('Unlock with Pro', 'vulopilot'),
						icon: 'lock',
						onClick: () => setIsProPopupOpen(true),
					}}
				/>
			</CardComponent>
			<PopupComponent
				open={isProPopupOpen}
				onClose={() => setIsProPopupOpen(false)}
				width={31.25}
				height="auto"
				position="lightbox"
			>
				{appLocalizer.khali_dabba ? (
					// Pro is active — this specific module just isn't
					// toggled on yet, so point at Modules rather than
					// pitching an upgrade the user already has.
					<ShowProPopup moduleName="woo-commerce-ai" />
				) : (
					<ShowProPopup />
				)}
			</PopupComponent>
		</>
	);
};

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
				{WooCommerceAiPanel ? (
					<WooCommerceAiPanel />
				) : (
					<WooCommerceAiLockedCard />
				)}
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
