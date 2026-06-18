import { __ } from '@wordpress/i18n';
export default {
    id: 'enquiry-quote',
    priority: 2,
    headerTitle: __('Enquiry $ Quote Rules', 'catalogx'),
    headerDescription: __(
        'Set up sales flow and catalog mode with integrated enquiry and quotation management.',
        'catalogx'
    ),
    headerIcon: 'cart',
    submitUrl: 'settings',
    modal: [
        //enquiry
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

    ],
};
