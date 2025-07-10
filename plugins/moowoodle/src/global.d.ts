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
        shop_url: string;
        tab_name: string;
        khali_dabba: boolean;
        accountmenu: any;
        settings_databases_value: any; // Use a more specific type if possible
        log_url: string;
        wc_email_url: string;
        moodle_site_url: string;
        wordpress_logo: string;
        moodle_logo: string;
        enrollment_list: string;
        cohort_list: string;
        wp_user_roles: any;
        md_user_roles: any;
        pro_settings_list: any;
    }

    interface CourseMyAcc {
        apiUrl: string;
        restUrl: string;
        nonce: string;
        moodle_site_url: string;
    }

    declare module '*.png';
    declare module '*.jpg';
    declare module '*.jpeg';

    var appLocalizer: AppLocalizer;
    var courseMyAcc: CourseMyAcc;
}
