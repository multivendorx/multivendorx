import { __ } from '@wordpress/i18n';

/**
 * Declarative settings-tab config — same shape
 * `vulopilot/src/components/Settings/General.ts` (and the free
 * multivendorx plugin's own Settings tabs) use, consumed by zyra's
 * `InputRenderer` (react-frontend.md's "declarative settings-config
 * pattern"). Backed by `Utill::SETTINGS_KEY`/`SETTINGS_DEFAULTS`
 * (classes/Utill.php) via `classes/RestAPI/Controllers/Settings.php`.
 *
 * Lives under `src/settings/General/` alongside `Frontend.ts` — grouped
 * into folders (General/Commerce/Integrations, `Advanced.ts` standalone)
 * the same way the free `multivendorx` plugin's own
 * `src/components/Settings/` tree groups its tabs (`StoreConfiguration/`,
 * `Finance/`, `Marketing/`, etc.) — `services/templateService.ts`'s
 * `require.context` scan already supports nested folders, this just
 * started using that instead of one flat 12-tab row.
 */
export default {
	id: 'general',
	priority: 1,
	headerTitle: __( 'General', 'vulocart' ),
	headerIcon: 'admin-settings',
	submitUrl: 'settings',
	modal: [
		{
			key: 'default_currency',
			type: 'text',
			label: __( 'Default currency', 'vulocart' ),
			desc: __(
				'ISO 4217 code used when a new offering is created without an explicit currency.',
				'vulocart'
			),
		},
		{
			key: 'default_offering_status',
			type: 'select',
			label: __( 'Default offering status', 'vulocart' ),
			desc: __(
				'Status a new offering gets when none is specified.',
				'vulocart'
			),
			options: [
				{ label: __( 'Draft', 'vulocart' ), value: 'draft' },
				{ label: __( 'Published', 'vulocart' ), value: 'published' },
			],
		},
	],
};
