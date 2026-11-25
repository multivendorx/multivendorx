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
        /** VuloMail's install state/CTA data for the "Email Logs" page. */
        vulomail: VuloMailData;
        /** VuloForm's install state/form id for the Subscription Form Designer settings tab. */
        vuloform: VuloFormAdminData;
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

    interface VuloMailData {
        is_vulomail_active: boolean;
        install_url: string;
        email_logs_url: string;
    }

    interface VuloFormAdminData {
        installed: boolean;
        plugin_url: string;
        can_activate: boolean;
        form_id: number;
    }

    /** Printed on the Plugins screen only, when VuloForm is active (Installer::enqueue_deactivation_confirm_assets()). */
    interface VuloformDeactivateLocalizer {
        plugin_file: string;
        title: string;
        description: string;
        question: string;
        cancel: string;
        confirm: string;
    }

    var appLocalizer: AppLocalizer;
    var subscription: Subscription;
    var vuloformDeactivateLocalizer: VuloformDeactivateLocalizer;

    module '*.png';
    module '*.jpg';
    module '*.jpeg';
}
