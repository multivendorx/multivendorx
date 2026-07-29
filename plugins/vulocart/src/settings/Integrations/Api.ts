import { __ } from '@wordpress/i18n';

/**
 * Backed by `Utill::SETTINGS_DEFAULTS`'s API section. Every real REST
 * route in this plugin (Offerings/Cart/Order/Modules/Settings) already has
 * its own `permission_callback` regardless of this tab (rest-api.md's
 * mandatory-permission-callback rule) — these two fields aren't wired
 * into any of those controllers yet, so treat them the same
 * "saved, not yet consumed" way as the rest of this tab set.
 */
export default {
	id: 'api',
	priority: 2,
	headerTitle: __( 'API', 'vulocart' ),
	headerIcon: 'vpn-key',
	submitUrl: 'settings',
	modal: [
		{
			key: 'enable_public_rest_api',
			type: 'checkbox',
			look: 'toggle',
			label: __( 'Enable public REST API', 'vulocart' ),
			desc: __(
				'Whether VuloCart\'s public-read endpoints (e.g. GET /offerings) are reachable at all, independent of the always-on admin-only endpoints.',
				'vulocart'
			),
			options: [
				{ key: 'enable_public_rest_api', label: '', value: 'enable_public_rest_api' },
			],
		},
		{
			key: 'api_rate_limit_per_minute',
			type: 'number',
			label: __( 'Rate limit (requests / minute)', 'vulocart' ),
			minNumber: 1,
			desc: __(
				'A per-client request cap, once the REST layer enforces one.',
				'vulocart'
			),
			dependent: { key: 'enable_public_rest_api', set: true },
		},
	],
};
