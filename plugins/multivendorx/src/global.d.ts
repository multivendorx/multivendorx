declare module 'body-scroll-lock' {
	export function disableBodyScroll(targetElement: Element): void;
	export function enableBodyScroll(targetElement: Element): void;
}

// Module declarations for asset imports
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.html' {
	const content: string;
	export default content;
}

// src/global.d.ts
export {};

declare global {
	interface AppLocalizer {
		google_maps_api_key: string;
		apiUrl: string;
		restUrl: string;
		nonce: string;
		khali_dabba: string | boolean;
		tab_name: string;
		admin_settings: any;
		all_store_meta: any;
		pages_list: {
			value: number;
			label: string;
			key: number;
		}[];
		pro_settings_list: any;
		country_list: any;
		capabilities: any;
		custom_roles: any;
		store_owners: any;
		managers_list: any;
		product_managers_list: any;
		customer_support_list: any;
		assistants_list: any;
		payments_settings: any;
		store_payment_settings: any;
		store_id: string | number;
		freeVersion: string;
		marketplace_site: string;
		site_url: string;
		color: any;
		ajaxurl: string;
		gateway_list: any;
		facilitators_list: any;
		user_id: string | number;
		currency: string;
		currency_symbol: string;
		price_format: string;
		decimal_sep: string;
		thousand_sep: string;
		decimals: string;
		edit_order_capability: any;
		all_verification_methods: any;
		tinymceApiKey: string;
		shipping_methods: any;
		state_list: any;
		module_page_url: string;
		admin_dashboard_url: string;
		store_page_url: string;
		pro_data: {
			version: string | boolean;
			manage_plan_url: string;
		};
		shop_url: string;
		admin_url: string;
		capability_pro: {
			[capability: string]: {
				prosetting: boolean;
				module?: string;
			};
		};
		taxes_enabled: string | boolean;
		permalink_structure: string | boolean;
		zones_list: any;
		adminUrl: string;
		module_page_url: string;
		current_user: {
			id: number;
			user_login: string;
			user_email: string;
			display_name: string;
			roles: string[];
			is_vendor?: boolean;
			store_id?: number;
		};
		order_meta: any;
		date_format: string;
		price_decimals: string;
		decimal_separator: string;
		thousand_separator: string;
		currency_position: string;
	}
	interface Color {
		color: any;
	}
	interface RegistrationForm {
		apiUrl: string;
		nonce: string;
		settings: Array;
		default_placeholder: Array;
		content_before_form: string;
		content_after_form: string;
		error_strings: Array;
		is_user_logged_in: boolean;
	}

	var appLocalizer: AppLocalizer;
	var color: Color;
	var registrationForm: RegistrationForm;
}
