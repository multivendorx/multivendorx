declare module 'body-scroll-lock' {
    export function disableBodyScroll(targetElement: Element): void;
    export function enableBodyScroll(targetElement: Element): void;
}

// src/global.d.ts
export {};

declare global {
    interface AppLocalizer {
        apiUrl: string;
        restUrl: string;
        nonce: string;
        subscriber_list: string;
        inventory_manager: string;
        export_button: string;
        khali_dabba: boolean;
        tab_name: string;
        settings_databases_value: any; // Use a more specific type if possible
        pro_url: string;
        pro_settings_list: any;
        pro_data: any;
        freeVersion: any;
        shop_url: any;
    }

    declare module '*.png';
    declare module '*.jpg';
    declare module '*.jpeg';

    var appLocalizer: AppLocalizer;
}
