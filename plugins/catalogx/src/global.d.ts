declare module 'body-scroll-lock' {
    export function disableBodyScroll(
        targetElement: HTMLElement | Element,
        options?: { reserveScrollBarGap?: boolean }
    ): void;
    export function enableBodyScroll(
        targetElement: HTMLElement | Element
    ): void;
    export function clearAllBodyScrollLocks(): void;
}

// src/global.d.ts
export {};

declare global {
    interface AppLocalizer {
        apiUrl: string;
        nonce: string;
        tab_name: string;
        restUrl: string;
        pages_data: Array;
        role_array: Array;
        /** The CatalogX admin page (`admin.php?page=catalogx`); `url` is the wp-admin base. */
        admin_url: string;
        /** The wp-admin base URL, with a trailing slash. */
        url: string;
        users_data: Array;
        products_data: Array;
        all_product_categories: Array;
        product_brands: Array;
        settings_databases_value: any; // Use a more specific type if possible
        active_modules: string[];
        user_role: string;
        khali_dabba: boolean;
        pro_url: string;
        order_edit: string;
        currency: string;
        notifima_active: boolean;
        multivendorx_active: boolean;
        quote_module_active: boolean;
        quote_base_url: string;
        redirect_url: string;
        free_version: any;
        pro_data: any;
        email_tags: Array;
        /** The logged-in admin's first name (or display name), for the dashboard greeting. */
        user_first_name?: string;
        /** The logged-in user's id (the enquiry inbox uses it to tell sent from received messages). */
        user_id?: number;
        /** VuloForm's install state/form id for the Enquiry form settings tab. */
        vuloform_enquiry: VuloFormAdminData;
        /** VuloForm's install state/form id for the Wholesale registration settings tab (CatalogX Pro only). */
        vuloform_wholesale?: VuloFormAdminData;
        /** VuloMail's install state/template name for the Email Customizer's enquiry email tab. */
        vulomail_enquiry: VuloMailAdminData;
    }

    interface VuloFormAdminData {
        installed: boolean;
        plugin_url: string;
        can_activate: boolean;
        form_id: number;
    }

    interface VuloMailAdminData {
        installed: boolean;
        plugin_url: string;
        available: boolean;
        edit_url: string;
        /** VuloMail template name, e.g. `catalogx/enquiry`. */
        template_name: string;
    }

    interface EnquiryFormData {
        apiUrl: string;
        restUrl: string;
        nonce: string;
        /** The configured VuloForm form id, 0 when none is set. */
        vuloform_form_id: number;
        /** Where to send the shopper after a successful enquiry; '' to stay on the page. */
        redirect_url: string;
        khali_dabba: boolean;
        product_data: Array;
        default_placeholder: Array;
        content_before_form: any;
        content_after_form: any;
        error_strings: Array;
    }

    interface QuoteCart {
        apiUrl: string;
        restUrl: string;
        nonce: string;
        name: string;
        email: string;
        quote_my_account_url: string;
        khali_dabba: boolean;
    }

    interface QuoteButton {
        apiUrl: string;
        restUrl: string;
        nonce: string;
    }

    interface AddToQuoteCart {
        ajaxurl: string;
        loader: string;
        no_more_product: string;
    }

    declare module '*.png';
    declare module '*.jpg';
    declare module '*.jpeg';
    declare module '*.gif';

    var appLocalizer: AppLocalizer;
    var enquiryFormData: EnquiryFormData;
    var quoteCart: QuoteCart;
    var quoteButton: QuoteButton;
    var addToQuoteCart: AddToQuoteCart;
}
