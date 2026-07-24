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
