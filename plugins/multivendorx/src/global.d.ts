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
		google_maps_api_key: any;
		apiUrl: string;
		restUrl: string;
		nonce: string;
		khali_dabba: any;
		tab_name: string;
		settings_databases_value: any;
		all_store_meta: any;
		pages_list: any;
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
		store_id: any;
		freeVersion: any;
		marketplace_site: any;
		site_url: any;
		color: any;
		ajaxurl: string;
		gateway_list: any;
		facilitators_list: any;
		user_id: any;
		currency: any;
		currency_symbol: any;
		price_format: any;
		decimal_sep: any;
		thousand_sep: any;
		decimals: any;
		edit_order_capability: any;
		all_verification_methods: any;
		tinymceApiKey: any;
		shipping_methods: any;
		state_list: any;
		module_page_url: any;
		admin_dashboard_url: any;
		store_page_url: string;
		pro_data: any;
		shop_url: any;
		admin_url: any;
		capability_pro: any;
		taxes_enabled: any;
		permalink_structure: any;
		zones_list: any;
		adminUrl: any;
		module_page_url: any;
		current_user: any;
		order_meta: any;
		date_format: any;
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
		content_before_form: any;
		content_after_form: any;
		error_strings: Array;
	}

	var appLocalizer: AppLocalizer;
	var color: Color;
	var registrationForm: RegistrationForm;
}
