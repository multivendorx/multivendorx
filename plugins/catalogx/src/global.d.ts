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
        all_pages: Array;
        role_array: Array;
        all_users: Array;
        all_products: Array;
        all_product_cat: Array;
        all_product_tag: Array;
        all_product_brand: Array;
        settings_databases_value: any; // Use a more specific type if possible
        active_modules: string[];
        user_role: string;
        banner_img: string;
        default_img: string;
        template1: string;
        template2: string;
        template3: string;
        template4: string;
        template5: string;
        template6: string;
        template7: string;
        khali_dabba: boolean;
        pro_url: string;
        order_edit: string;
        site_url: string;
        module_page_url: string;
        settings_page_url: string;
        enquiry_form_settings_url: string;
        customization_settings_url: string;
        wholesale_settings_url: string;
        rule_url: string;
        currency: string;
        notifima_active: boolean;
        mvx_active: boolean;
        quote_module_active: boolean;
        quote_base_url: string;
        redirect_url: string;
    }

    interface EnquiryFormData {
        apiUrl: string;
        nonce: string;
        settings_free: Array;
        settings_pro: Array;
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
