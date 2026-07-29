import { __ } from '@wordpress/i18n';

/**
 * Backed by `Utill::SETTINGS_DEFAULTS`'s AI section. No AI integration
 * exists in this codebase yet (no provider client, no recommendation
 * engine) — same "saved, not yet consumed" status as the Payments/
 * Shipping/Taxes tabs, kept honest rather than hidden.
 *
 * Deliberately no "Enable AI recommendations" toggle here — same
 * reasoning as Mcp.ts: AI is its own addon module now
 * (`modules/Ai/Module.php`), and that module's activation on the Modules
 * page is the real on/off switch — enforced below via
 * `moduleEnabled: 'ai'`. This tab only holds configuration for once that
 * module exists.
 */
export default {
	id: 'ai',
	priority: 4,
	headerTitle: __( 'AI', 'vulocart' ),
	headerIcon: 'ai',
	submitUrl: 'settings',
	modal: [
		{
			key: 'ai_provider',
			type: 'select',
			label: __( 'AI provider', 'vulocart' ),
			desc: __(
				'Which AI provider powers AI features, once the AI module is active.',
				'vulocart'
			),
			options: [
				{ label: __( 'None', 'vulocart' ), value: 'none' },
				{ label: __( 'OpenAI', 'vulocart' ), value: 'openai' },
				{ label: __( 'Anthropic', 'vulocart' ), value: 'anthropic' },
			],
			moduleEnabled: 'ai',
		},
	],
};
