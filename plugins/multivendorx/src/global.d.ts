declare module 'body-scroll-lock' {
    export function disableBodyScroll( targetElement: Element ): void;
    export function enableBodyScroll( targetElement: Element ): void;
}

// src/global.d.ts
export {};

declare global {
    interface AppLocalizer {
        apiUrl: string;
        restUrl: string;
        nonce: string;
        khali_dabba: boolean;
        tab_name: string;
        settings_databases_value: any;
        pages_list: any;
        vendor_dashboard_pages: any;
        pro_url: string;
        pro_settings_list: any;
        country_list: any;
    }

    declare module '*.png';
    declare module '*.jpg';
    declare module '*.jpeg';

    var appLocalizer: AppLocalizer;
}
