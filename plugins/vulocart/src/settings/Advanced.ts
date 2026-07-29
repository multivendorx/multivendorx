import { __ } from '@wordpress/i18n';

/**
 * Backed by `Utill::SETTINGS_DEFAULTS`'s Advanced section.
 * `enable_debug_logging` is genuinely read by `Utill::log()` — the sole
 * catch-and-record path for a broken module's constructor
 * (Modules::load_active_modules()) — mirrors
 * VuloPilot\Utill::log()'s identical gate/precedent exactly.
 *
 * Deliberately kept as a standalone top-level file (not folded into a
 * folder) — same as multivendorx's own `Intelligence.ts` sitting directly
 * at its Settings root — priority 4 sorts it after the three folders
 * (General=1/Commerce=2/Integrations=3, see each folder's own
 * FolderPriority.ts) at the top-level nav.
 */
export default {
	id: 'advanced',
	priority: 4,
	headerTitle: __( 'Advanced', 'vulocart' ),
	headerIcon: 'tools',
	submitUrl: 'settings',
	modal: [
		{
			key: 'enable_debug_logging',
			type: 'checkbox',
			look: 'toggle',
			label: __( 'Enable debug logging', 'vulocart' ),
			desc: __(
				'Writes module-loading failures to the server error log. Leave off unless you\'re actively debugging.',
				'vulocart'
			),
			options: [
				{ key: 'enable_debug_logging', label: '', value: 'enable_debug_logging' },
			],
		},
	],
};
