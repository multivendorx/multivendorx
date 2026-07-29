import { __ } from '@wordpress/i18n';

/**
 * Static module metadata for zyra's `ModuleGridComponent`
 * (pages/Modules/Modules.tsx) — the *available* module list (name,
 * description, category) is frontend-only config, not fetched from PHP;
 * only which ids are *active* comes from the REST layer
 * (classes/RestAPI/Controllers/Modules.php). Same shape as
 * `multivendorx/src/components/Modules/index.ts`. `cart`/`order` ship in
 * this free plugin itself (`modules/Cart`, `modules/Order` —
 * module-architecture.md); `passport` ships in `vulocart-pro`
 * (`proModule: true` gates it behind `vulocartLocalizer.khali_dabba`, same
 * as every other proModule-flagged entry in the sibling plugins).
 *
 * `mcp`/`ai` also ship in this free plugin (`modules/Mcp`, `modules/Ai`)
 * — deliberately minimal Module.php stubs today (see their own
 * docblocks), whose entire purpose right now is to be a real toggle here
 * and to gate `src/settings/Mcp.ts`'s/`Ai.ts`'s config fields via
 * `moduleEnabled`, replacing the "Enable MCP server"/"Enable AI
 * recommendations" Settings-tab toggles that used to duplicate this
 * same on/off state.
 */
export default {
	category: false,
	tab: 'modules',
	modules: [
		{
			id: 'cart',
			name: __( 'Cart', 'vulocart' ),
			desc: __(
				'The Cart Engine — add/update/remove line items, headless-ready via a client-held cart token.',
				'vulocart'
			),
			proModule: false,
		},
		{
			id: 'order',
			name: __( 'Order', 'vulocart' ),
			desc: __(
				'Turns a Cart into a placed Order — requires the Cart module to be active.',
				'vulocart'
			),
			proModule: false,
		},
		{
			id: 'passport',
			name: __( 'Passport', 'vulocart' ),
			desc: __(
				'Give every Offering a Digital Passport — serial number, manufacturer, warranty, and other provenance details.',
				'vulocart'
			),
			proModule: true,
		},
		{
			id: 'mcp',
			name: __( 'MCP', 'vulocart' ),
			desc: __(
				'Model Context Protocol server — exposes VuloCart\'s catalog/orders to MCP-compatible AI clients.',
				'vulocart'
			),
			proModule: false,
		},
		{
			id: 'ai',
			name: __( 'AI', 'vulocart' ),
			desc: __(
				'AI-generated offering/upsell recommendations.',
				'vulocart'
			),
			proModule: false,
		},
	],
};
