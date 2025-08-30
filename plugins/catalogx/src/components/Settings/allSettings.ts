import { __, sprintf } from '@wordpress/i18n';
export default {
    id: 'all-settings',
    priority: 20,
    name: __( 'Shopping Journey', 'catalogx' ),
    desc: __(
        'Set up sales flow and catalog mode with integrated enquiry and quotation management.',
        'catalogx'
    ),
    icon: 'adminlib-cart',
    submitUrl: 'settings',
    modal: [
        {
            key: 'enable_cart_checkout',
            type: 'checkbox',
            label: __( 'Sitewide buy mode', 'catalogx' ),
            desc: sprintf(
                /* translators: %s will be replaced with a link to CatalogX Pro */
                __(
                    'Enabling this setting with CatalogX activates the catalog-only mode on your site, preventing customers from making purchases. To allow purchasing functionality, upgrade to %s and enable this setting to activate the buying mode.',
                    'catalogx'
                ),
                '<a href="' +
                    appLocalizer.pro_url +
                    '" target="_blank">CatalogX Pro</a>'
            ),
            options: [
                {
                    key: 'enable_cart_checkout',
                    value: 'enable_cart_checkout',
                },
            ],
            proSetting: true,
            look: 'toggle',
            moduleEnabled: 'catalog',
        },
        {
            key: 'redirect_cart_page',
            type: 'select',
            label: __( 'Cart / Checkout Redirect Page', 'catalogx' ),
            options: [
                {
                    value: '',
                    label: 'Home',
                    key: '',
                },
                ...appLocalizer.all_pages,
            ],
            dependent: {
                key: 'enable_cart_checkout',
                set: false,
            },
            desc: sprintf(
                /* translators: %s will be replaced with a link to CatalogX Pro */
                __(
                    'Redirect users to the homepage when they click on the cart or checkout page. To customize the redirection to a different page, an upgrade to %s is required.',
                    'catalogx'
                ),
                '<a href="' +
                    appLocalizer.pro_url +
                    '" target="_blank">CatalogX Pro</a>'
            ),

            proSetting: true,
            moduleEnabled: 'catalog',
        },
        {
            key: 'separator_content',
            type: 'section',
            label: __( 'Enquiry', 'catalogx' ),
        },
        {
            key: 'enquiry_user_permission',
            type: 'checkbox',
            label: __(
                'Restrict product enquiries for logged-in users only',
                'catalogx'
            ),
            desc: __(
                "If enabled, non-logged-in users can't access the enquiry flow.",
                'catalogx'
            ),
            options: [
                {
                    key: 'enquiry_logged_out',
                    value: 'enquiry_logged_out',
                },
            ],
            look: 'toggle',
            moduleEnabled: 'enquiry',
        },
        {
            key: 'is_enable_out_of_stock',
            type: 'checkbox',
            label: __( 'Enquiry for out-of-stock products only', 'catalogx' ),
            desc: __(
                'Enquiry button is shown exclusively for products that are out of stock. For items that are in stock, the Add-to-Cart button will be displayed instead.',
                'catalogx'
            ),
            options: [
                {
                    key: 'is_enable_out_of_stock',
                    value: 'is_enable_out_of_stock',
                },
            ],
            look: 'toggle',
            moduleEnabled: 'enquiry',
        },
        // This settings for notify me it works when only site off buying settings on and stock alert plugin active
        // popup - propopup, modulepopup
        {
            key: 'notify_me_button',
            type: 'checkbox',
            label: __( 'In-Stock notify me button', 'catalogx' ),
            desc: __(
                'This option allows customers to subscribe for automatic stock notifications.',
                'catalogx'
            ),
            options: [
                {
                    key: 'notify_me_button',
                    label: __( '', 'catalogx' ),
                    value: 'notify_me_button',
                },
            ],
            look: 'toggle',
            moduleEnabled: '',
            proSetting: true,
            dependentPlugin: appLocalizer.notifima_active,
            dependentSetting: 'enable_cart_checkout',
        },
        {
            key: 'is_disable_popup',
            type: 'setting-toggle',
            label: __( 'Display enquiry form as', 'catalogx' ),
            desc: __(
                'Select whether the form is displayed directly on the page or in a pop-up window.',
                'catalogx'
            ),
            options: [
                {
                    key: 'popup',
                    value: 'popup',
                    label: 'Popup',
                },
                {
                    key: 'inline',
                    value: 'inline',
                    label: 'Inline In-page',
                },
            ],
            moduleEnabled: 'enquiry',
        },
        {
            key: 'is_page_redirect',
            type: 'checkbox',
            label: __( 'Redirect after enquiry form Submission', 'catalogx' ),
            desc: __(
                'Enable this to redirect user to another page after successful enquiry submission.',
                'catalogx'
            ),
            options: [
                {
                    key: 'is_page_redirect',
                    value: 'is_page_redirect',
                },
            ],
            look: 'toggle',
            moduleEnabled: 'enquiry',
        },
        {
            key: 'redirect_page_id',
            dependent: {
                key: 'is_page_redirect',
                set: true,
            },
            type: 'select',
            label: __( 'Post enquiry submission redirect page', 'catalogx' ),
            desc: __(
                'Select page where user will be redirected after successful enquiry.',
                'catalogx'
            ),
            options: appLocalizer.all_pages,
            moduleEnabled: 'enquiry',
        },
        // {
        //     key: 'is_enable_multiple_product_enquiry',
        //     type: 'checkbox',
        //     label: __( "Multi-product enquiry", 'catalogx' ),
        //     desc: __("Enable multiple enquiry flow so customers can add several products to their enquiry cart and submit a single enquiry for all selected items.", "catalogx"),
        //     options: [
        //         {
        //             key: "is_enable_multiple_product_enquiry",
        //             value: "is_enable_multiple_product_enquiry"
        //         }
        //     ],
        //     proSetting: true,
        //     look: "toggle",
        //     moduleEnabled: 'enquiry',
        // },
        {
            key: 'separator_content',
            type: 'section',
            label: __( 'Quotation', 'catalogx' ),
        },
        {
            key: 'quote_user_permission',
            type: 'checkbox',
            label: __(
                'Limit quotation requests to logged-in users only',
                'catalogx'
            ),
            desc: __(
                'If enabled, non-logged-in users cannot submit quotation requests.',
                'catalogx'
            ),
            options: [
                {
                    key: 'logged_out',
                    value: 'logged_out',
                },
            ],
            look: 'toggle',
            moduleEnabled: 'quote',
            tour: 'quote-permission',
        },
        {
            key: 'set_expiry_time',
            type: 'text',
            label: __( 'Quotation expiry duration', 'catalogx' ),
            desc: __(
                'Set the period after which a quotation will expire and no longer be valid for purchase.',
                'catalogx'
            ),
            parameter: __( 'days', 'catalogx' ),
            proSetting: true,
            moduleEnabled: 'quote',
        },
        {
            key: 'separator_content',
            type: 'section',
            label: __( 'PDF Manager', 'catalogx' ),
        },
        {
            key: 'display_pdf',
            type: 'multi-checkbox-table',
            label: __( 'Attachment', 'catalogx' ),
            classes: 'gridTable',
            rows: [
                {
                    key: 'allow_download_pdf',
                    label: __( 'Download as PDF', 'catalogx' ),
                },
                {
                    key: 'attach_pdf_to_email',
                    label: __( 'Attach with Email', 'catalogx' ),
                },
            ],
            columns: [
                {
                    key: 'enquiry_pdf_permission',
                    label: __( 'Enquiry', 'catalogx' ),
                    moduleEnabled: 'enquiry',
                },
                {
                    key: 'quote_pdf_permission',
                    label: __( 'Quote', 'catalogx' ),
                    moduleEnabled: 'quote',
                },
            ],
            proSetting: true,
        },
    ],
};
