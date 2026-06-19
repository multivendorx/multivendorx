import { __, sprintf } from '@wordpress/i18n';
export default {
    id: 'customer-engagement',
    priority: 3,
    headerTitle: __('Customer Engagement', 'catalogx'),
    headerDescription: __(
        'Set up sales flow and catalog mode with integrated enquiry and quotation management.',
        'catalogx'
    ),
    headerIcon: 'cart',
    submitUrl: 'settings',
    modal: [
        //enquiry
        {
            key: 'section',
            type: 'section',
            title: __('Configure how customers submit product enquiries and how enquiry requests are managed.', 'catalogx'),
        },
        {
            key: 'enquiry_user_permission',
            type: 'choice-toggle',
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
                    key: 'logged_in_only',
                    label: __('Logged in only', 'catalogx'),
                    value: 'logged_in_only',
                },
                {
                    key: 'everyone',
                    label: __('Everyone', 'catalogx'),
                    value: 'everyone',
                },
            ],
            moduleEnabled: 'enquiry',
        },
        {
            key: 'is_enable_out_of_stock',
            type: 'choice-toggle',
            label: __(
                'Show enquiry button for',
                'catalogx'
            ),
            desc: __(
                "If enabled, non-logged-in users can't access the enquiry flow.",
                'catalogx'
            ),
            options: [
                {
                    key: 'all_products',
                    label: __('All products', 'catalogx'),
                    value: 'all_products',
                },
                {
                    key: 'is_enable_out_of_stock',
                    label: __('Out-of-stock products only', 'catalogx'),
                    value: 'is_enable_out_of_stock',
                },
            ],
            moduleEnabled: 'enquiry',
        },
        // {
        //     key: 'is_enable_out_of_stock',
        //     type: 'checkbox',
        //     label: __('Enquiry for out-of-stock products only', 'catalogx'),
        //     desc: __(
        //         'Enquiry button is shown exclusively for products that are out of stock. For items that are in stock, the Add-to-Cart button will be displayed instead.',
        //         'catalogx'
        //     ),
        //     options: [
        //         {
        //             key: 'is_enable_out_of_stock',
        //             value: 'is_enable_out_of_stock',
        //         },
        //     ],
        //     look: 'toggle',
        //     moduleEnabled: 'enquiry',
        // },
        // This settings for notify me it works when only site off buying settings on and stock alert plugin active
        // popup - propopup, modulepopup
        {
            key: 'notify_me_button',
            type: 'checkbox',
            label: __('In-Stock notify me button', 'catalogx'),
            desc: __(
                'This option allows customers to subscribe for automatic stock notifications.',
                'catalogx'
            ),
            options: [
                {
                    key: 'notify_me_button',
                    label: __('', 'catalogx'),
                    value: 'notify_me_button',
                },
            ],
            look: 'toggle',
            proSetting: true,
            dependentPlugin: [
                {
                    plugin: 'woocommerce-product-stock-alert/product_stock_alert.php',
                    name: 'Notifima',
                    link: 'https://wordpress.org/plugins/woocommerce-product-stock-alert/',
                }
            ]
        },
        {
            key: 'is_disable_popup',
            type: 'choice-toggle',
            label: __('Display enquiry form as', 'catalogx'),
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
            options: [
                {
                    key: 'is_page_redirect',
                    value: 'is_page_redirect',
                }
            ],
            look: 'toggle',
            label: __('Redirect to a different page for enquiry form', 'catalogx'),
            moduleEnabled: 'enquiry'
        },
        {
            key: 'redirect_page_id',
            dependent: {
                key: "is_page_redirect",
                set: true
            },
            type: 'select',
            label: __('Post enquiry submission redirect page', 'catalogx'),
            desc: __('Select page where user will be redirected after successful enquiry.', 'catalogx'),
            options: appLocalizer.pages_data,
            moduleEnabled: 'enquiry'
        },

        //quote
        {
            key: 'section',
            type: 'section',
            title: __('Configure how customers request quotations and how quote requests are managed.', 'catalogx'),
        },
        {
            key: 'quote_user_permission',
            type: 'choice-toggle',
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
                    key: 'logged_in_only',
                    label: __('Logged in only', 'catalogx'),
                    value: 'logged_in_only',
                },
                {
                    key: 'everyone',
                    label: __('Everyone', 'catalogx'),
                    value: 'everyone',
                },
            ],
            moduleEnabled: 'quote',
            tour: 'quote-permission',
        },
        {
            key: 'set_expiry_time',
            type: 'text',
            label: __('Quotation validity', 'catalogx'),
            size: 10,
            desc: __(
                'Set the period after which a quotation will expire and no longer be valid for purchase.',
                'catalogx'
            ),
            postText: __('days', 'catalogx'),
            proSetting: true,
            moduleEnabled: 'quote',
        },

        //shopping
        {
            key: 'section',
            type: 'section',
            title: __('Configure sitewide buying mode and manage cart and checkout access.', 'catalogx'),
        },
        {
            key: 'enable_cart_checkout',
            type: 'checkbox',
            label: __('Sitewide buy mode', 'catalogx'),
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
            label: __('Cart / Checkout Redirect Page', 'catalogx'),
            size: 15,
            options: [
                {
                    value: '',
                    label: 'Home',
                    key: '',
                },
                ...appLocalizer.pages_data,
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
        //extra
        {
            key: 'section',
            type: 'section',
            title: __('Configure PDF download and email attachment settings for enquiries and quotations.', 'catalogx'),
        },
        {
            key: 'display_pdf',
            type: 'multi-checkbox-table',
            storeSetting: true,
            label: __('Attachment', 'catalogx'),
            classes: 'gridTable',
            rows: [
                {
                    key: 'allow_download_pdf',
                    label: __('Download as PDF', 'catalogx'),
                },
                {
                    key: 'attach_pdf_to_email',
                    label: __('Attach with Email', 'catalogx'),
                },
            ],
            columns: [
                {
                    key: 'enquiry_pdf_permission',
                    label: __('Enquiry', 'catalogx'),
                    type: 'checkbox',
                    moduleEnabled: 'enquiry',
                },
                {
                    key: 'quote_pdf_permission',
                    label: __('Quote', 'catalogx'),
                    type: 'checkbox',
                    moduleEnabled: 'quote',
                },
            ],
            proSetting: true,
        },

    ],
};
