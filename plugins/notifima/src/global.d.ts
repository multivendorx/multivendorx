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
        khali_dabba: boolean;
        settings_databases_value: any;
        pro_url: string;
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
        /** The configured VuloForm form id, 0 when none is set. */
        vuloform_form_id?: number;
        /** VuloForm's REST namespace, e.g. `vuloform/v1`. */
        vuloform_rest_namespace?: string;
    }

    interface VuloMailLocalizer {
        is_vulomail_active: boolean;
        install_url: string;
        email_logs_url: string;
    }

    var appLocalizer: AppLocalizer;
    var subscription: Subscription;
    var vuloMailLocalizer: VuloMailLocalizer;

    module '*.png';
    module '*.jpg';
    module '*.jpeg';
}
