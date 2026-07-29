/* global vulocartLocalizer */
import React from 'react';
import { ButtonInput } from '@zyra/inputs';
import { __, sprintf } from '@wordpress/i18n';
import './Popup.scss';

interface PopupProps {
	moduleName?: string;
	plugin?: string;
}

/**
 * Known acronym module ids get their real casing ("MCP", "AI") instead
 * of the generic capitalize-each-word fallback, which would otherwise
 * read "Mcp"/"Ai" — everything else falls back to that generic rule.
 */
const ACRONYM_LABELS: Record< string, string > = {
	mcp: 'MCP',
	ai: 'AI',
};

/**
 * The popup header icon is `adminfont-${moduleName}` — fine for module
 * ids that happen to already be an icon name (e.g. vulopilot's
 * 'automation'), but 'mcp' has no matching glyph in zyra's icon set
 * (`ai` does — checked against `@zyra/theme`'s fonts.scss, same source
 * `src/settings/Mcp.ts`'s/`Ai.ts`'s own `headerIcon` values were verified
 * against). Overridden here rather than renaming the module id itself.
 */
const ICON_OVERRIDES: Record< string, string > = {
	mcp: 'centralized-connections',
};

const formatModuleName = ( name: string ): string => {
	if ( ACRONYM_LABELS[ name ] ) {
		return ACRONYM_LABELS[ name ];
	}

	return name
		.split( '-' )
		.map( ( word ) => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) )
		.join( ' ' );
};

/**
 * The popup zyra's InputRenderer opens when a field with `moduleEnabled`/
 * `dependentPlugin`/`proSetting` is locked — passed in as the `Popup`
 * prop on `<InputRenderer>` (pages/Settings/Settings.tsx). Mirrors
 * `vulopilot/src/components/Popup/Popup.tsx`'s structure, trimmed to
 * what VuloCart actually needs today: the `moduleName` branch is the one
 * real settings fields use (`src/settings/Mcp.ts`'s `mcp_api_key`,
 * `Ai.ts`'s `ai_provider`). The default (no moduleName/plugin) branch —
 * reachable if a future field sets `proSetting: true` — is a plain
 * upgrade CTA, not a fabricated feature list, since this plugin has no
 * central Pro-feature catalog to draw one from honestly.
 */
const Popup: React.FC< PopupProps > = ( props ) => {
	if ( props.plugin ) {
		return (
			<div className="popup-wrapper">
				<div className="popup-header">
					<i className={ `adminfont-${ props.plugin }` } />
				</div>
				<div className="popup-body">
					<div className="module-name">
						{ sprintf(
							/* translators: %s: Plugin name. */
							__( 'Plugin required: %s', 'vulocart' ),
							props.plugin
						) }
					</div>
					<div className="module-desc">
						{ sprintf(
							/* translators: %s: Plugin name. */
							__(
								'This feature requires the "%s" plugin to be active.',
								'vulocart'
							),
							props.plugin
						) }
					</div>
					<ButtonInput
						position="center"
						buttons={ [
							{
								icon: 'eye',
								text: __( 'Manage plugins', 'vulocart' ),
								onClick: () => {
									window.open(
										`${ vulocartLocalizer.adminUrl.replace( /admin\.php.*/, '' ) }plugins.php`,
										'_blank'
									);
								},
							},
						] }
					/>
				</div>
			</div>
		);
	}

	if ( props.moduleName ) {
		const iconName = ICON_OVERRIDES[ props.moduleName ] ?? props.moduleName;

		return (
			<div className="popup-wrapper">
				<div className="popup-header">
					<i className={ `adminfont-${ iconName }` } />
				</div>
				<div className="popup-body">
					<div className="module-name">
						{ sprintf(
							/* translators: %s: Module name. */
							__( 'Activate %s', 'vulocart' ),
							formatModuleName( props.moduleName )
						) }
					</div>
					<div className="module-desc">
						{ sprintf(
							/* translators: %s: Module name. */
							__(
								'This setting is only usable once the %s module is active.',
								'vulocart'
							),
							formatModuleName( props.moduleName )
						) }
					</div>
					<ButtonInput
						position="center"
						buttons={ [
							{
								icon: 'eye',
								text: __( 'Enable now', 'vulocart' ),
								onClick: () => {
									window.open( `${ vulocartLocalizer.adminUrl }#&tab=modules` );
								},
							},
						] }
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="popup-wrapper">
			<div className="top-section">
				<div className="heading">{ __( 'Unlock VuloCart Pro', 'vulocart' ) }</div>
				<div className="description">
					{ __(
						'This feature is part of VuloCart Pro.',
						'vulocart'
					) }
				</div>
				<a
					className="admin-btn"
					href={ vulocartLocalizer.shop_url }
					target="_blank"
					rel="noreferrer"
				>
					{ __( 'Upgrade to Pro', 'vulocart' ) }
					<i className="adminfont-arrow-right arrow-icon"></i>
				</a>
			</div>
		</div>
	);
};

export default Popup;
