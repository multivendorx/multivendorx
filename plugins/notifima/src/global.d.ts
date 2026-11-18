declare module 'body-scroll-lock' {
    export function disableBodyScroll(_targetElement: Element): void;
    export function enableBodyScroll(_targetElement: Element): void;
}

export {};

declare global {
    /** One input of Notifima Pro's license form (LicenseManager::get_settings_form_data()). */
    interface LicenseFormField {
        name: string;
        label: string;
        value: string;
    }

    /** What Notifima Pro passes in `appLocalizer.pro_data.license`. Empty without Pro. */
    interface LicenseFormData {
        is_active: boolean;
        is_staging: boolean;
        title: string;
        action_url: string;
        hidden: Record<string, string>;
        fields: LicenseFormField[];
        strings: {
            activate: string;
            deactivate: string;
            status: string;
            activated: string;
            deactivated: string;
            staging_notice: string;
        };
    }

    /** `notifima_update_pro_data`: `version` is false without Notifima Pro. */
    interface ProData {
        version: string | false;
        manage_plan_url: string;
        license?: LicenseFormData | never[];
    }

    interface AppLocalizer {
        apiUrl: string;
        restUrl: string;
        nonce: string;
        admin_url: string;
        subscriber_list: string;
        inventory_manager: string;
        export_button: string;
        khali_dabba: boolean;
        tab_name: string;
        settings_databases_value: any;
        pro_url: string;
        pro_settings_list: any;
        free_version: any;
        pro_data: ProData;
        /** The logged-in admin's first name (or display name), for the dashboard greeting. */
        user_first_name?: string;
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
