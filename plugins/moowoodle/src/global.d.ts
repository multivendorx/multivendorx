declare module 'body-scroll-lock' {
	// eslint-disable-next-line no-unused-vars -- ambient type signature; the param name is part of the declared shape, not a real binding.
	export function disableBodyScroll(targetElement: Element): void;
	// eslint-disable-next-line no-unused-vars -- ambient type signature; the param name is part of the declared shape, not a real binding.
	export function enableBodyScroll(targetElement: Element): void;
}

// src/global.d.ts
export {};

declare global {
	interface AppLocalizer {
		apiUrl: string;
		restUrl: string;
		nonce: string;
		shop_url: string;
		video_url: string;
		tab_name: string;
		khali_dabba: boolean;
		account_menu: any;
		admin_settings: any; // Use a more specific type if possible
		wc_email_url: string;
		moodle_site_url: string;
		wp_user_roles: any;
		md_user_roles: any;
		pro_settings_list: any;
		free_version: any;
		chat_url: any;
		pro_data: any;
		products_link: any;
	}

	interface CourseMyAcc {
		apiUrl: string;
		restUrl: string;
		nonce: string;
	}

	declare module '*.png';
	declare module '*.jpg';
	declare module '*.jpeg';

	var appLocalizer: AppLocalizer;
	var courseMyAcc: CourseMyAcc;
}
