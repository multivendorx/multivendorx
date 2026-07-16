declare module 'body-scroll-lock' {
    export function disableBodyScroll(targetElement: Element): void;
    export function enableBodyScroll(targetElement: Element): void;
}

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
        settings_databases_value: any;
        pro_url: string;
        pro_settings_list: any;
        free_version: any;
    }

    interface Subscription {
        apiUrl: string;
        restUrl: string;
        nonce: string;
        display_type: string;
        lead_time?: string;
        khali_dabba?: boolean;
        email?: string;
    }

    var appLocalizer: AppLocalizer;
    var subscription: Subscription;

    module '*.png';
    module '*.jpg';
    module '*.jpeg';
}