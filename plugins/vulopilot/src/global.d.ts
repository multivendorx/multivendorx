import type { ComponentType } from 'react';

export {};

declare global {
	/**
	 * Shape of the `appLocalizer` object localized by
	 * FrontendScripts::localize_scripts() — keep this in sync with that
	 * method's wp_localize_script() payload.
	 */
	interface AppLocalizer {
		apiUrl: string;
		restUrl: string;
		nonce: string;
		plugin_url: string;
		admin_url: string;
		site_url: string;
		version: string;
		plugin_slug: string;
		text_domain: string;
		date_format: string;
		/** Whether VuloPilot Pro is installed, active, and license-active — feeds zyra's configureZyra()/ZyraVariable.khali_dabba. */
		khali_dabba: boolean;
		/** Kebab-case ids of every currently-active module (Free's own + any active vulopilot-pro modules) — feeds zyra's `moduleEnabled` settings-field gate and vulopilot-pro/src/index.tsx's per-module JS loading. */
		active_modules: string[];
		/** Where to send a user who wants to buy VuloPilot Pro — feeds zyra's configureZyra()/ZyraVariable.shop_url and the generic "Upgrade to Pro" popup's CTA link. */
		shop_url: string;
		/** VuloPilot Pro's own reported version/account-management link — `version: false` when Pro isn't installed/registered, populated via the `vulopilot_update_pro_data` filter Pro's own bootstrap hooks. Feeds the header's "Pro: …" version tag. */
		pro_data: {
			version: string | false;
			manage_plan_url: string;
		};
	}


	var appLocalizer: AppLocalizer;

	/* eslint-disable no-unused-vars */
	interface Window {
		VULOPILOT_ROUTES: {
			tab: string;
			component: ComponentType<Record<string, unknown>>;
		}[];
		registerVuloPilotRoute: (route: {
			tab: string;
			component: ComponentType<Record<string, unknown>>;
		}) => void;
	}
	/* eslint-enable no-unused-vars */
}
