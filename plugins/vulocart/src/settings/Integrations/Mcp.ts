import { __ } from '@wordpress/i18n';

/**
 * Backed by `Utill::SETTINGS_DEFAULTS`'s MCP section. No MCP (Model
 * Context Protocol) server exists in this codebase yet — this tab exists
 * so VuloCart's "AI Commerce OS" positioning has a real, saved home for
 * this config once that server is built, rather than a settings gap.
 *
 * Deliberately no "Enable MCP server" toggle here: MCP is its own addon
 * module now (`modules/Mcp/Module.php`, module-architecture.md — same
 * shape as the Passport module), not a Settings-tab checkbox. Activating/
 * deactivating it on the Modules page *is* the on/off switch — enforced
 * below via `moduleEnabled: 'mcp'`, zyra's InputRenderer field-lock
 * mechanism (same one `vulopilot/src/components/Settings/Automation.ts`'s
 * `automation_cooldown_minutes` uses for its own module gate): the field
 * renders locked with an "Activate MCP" popup (src/components/Popup/
 * Popup.tsx, passed into `<InputRenderer>` in Settings.tsx) until the
 * `mcp` module is active. This tab only holds the module's
 * *configuration*, the same relationship General.ts's
 * `default_offering_status` has to the (already-active, non-toggleable-here)
 * core plugin.
 *
 * `mcp_api_key` uses `type: 'password'` (masked input, same
 * TextInputFieldComponent as `text`/`number` — @zyra/builders'
 * fieldUtils.ts registry) since it's credential-shaped even though
 * nothing validates it yet.
 */
export default {
	id: 'mcp',
	priority: 3,
	headerTitle: __( 'MCP', 'vulocart' ),
	headerIcon: 'centralized-connections',
	submitUrl: 'settings',
	modal: [
		{
			key: 'mcp_api_key',
			type: 'password',
			label: __( 'MCP API key', 'vulocart' ),
			desc: __(
				'Credential an MCP client would present to authenticate against the server, once the MCP module is active.',
				'vulocart'
			),
			moduleEnabled: 'mcp',
		},
	],
};
