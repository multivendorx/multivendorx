import { __, sprintf } from '@wordpress/i18n';
export default {
    id: 'customer-engagement',
    priority: 4,
    headerTitle: __('Enquiry & Quote', 'catalogx'),
    settingTitle: __('Purchase experience', 'catalogx'),
    headerDescription: __(
        'Define how customers move from product browsing to purchasing across your store.',
        'catalogx'
    ),
    headerIcon: 'cart',
    submitUrl: 'settings',
    modal: [
        //shopping
        {
            key: 'enable_cart_checkout',
            type: 'choice-toggle',
            label: __('Store experience', 'catalogx'),
            settingDescription: __(
                'Choose whether customers can browse products as a catalog or purchase them through your store.',
                'catalogx'
            ),
            desc: __(
                '<ul><li>Browse products only - Hide the Add to Cart button and disable purchasing across your store.</li><li>Browse & purchase products - Display the Add to Cart button and allow customers to add products to cart and complete purchases.</li></ul>',
                'catalogx'
            ),
            options: [
                {
                    key: 'catalog_only',
                    label: __('Browse products only', 'catalogx'),
                    value: 'catalog_only',
                },
                {
                    key: 'buy_mode',
                    label: __('Browse & purchase products', 'catalogx'),
                    value: 'buy_mode',
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
                set: true,
                value: 'catalog_only',
            },
            desc: sprintf(
                /* translators: %s will be replaced with a link to CatalogX Pro */
                __(
                    'By default, customers are redirected to the homepage when they access the cart or checkout pages. Select a different page to customize this behavior. An upgrade to %s is required.',
                    'catalogx'
                ),
                '<a href="' +
                appLocalizer.pro_url +
                '" target="_blank">CatalogX Pro</a>'
            ),

            proSetting: true,
            moduleEnabled: 'catalog',
        },
        //enquiry
        {
            key: 'section',
            type: 'section',
            title: __('Enquiry journey', 'catalogx'),
            desc: __('Define the customer experience from enquiry initiation to submission.',
                'catalogx'
            ),
        },

        {
            key: 'enquiry_user_permission',
            type: 'choice-toggle',
            label: __(
                'Who can submit enquiries',
                'catalogx'
            ),
            settingDescription: __('Control whether enquiries are available to all visitors or only logged-in customers.',
                'catalogx'
            ),
            desc: __('<ul><li>Everyone - Any visitor can submit product enquiries.</li><li>Logged-in Customers - Only authenticated customers can submit enquiries.</li></ul>',
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
            settingDescription: __(
                'Limit enquiries to products currently unavailable for purchase.',
                'catalogx'
            ),
            desc: __(
                '<ul><li>All Products - Display the enquiry button on every product, regardless of stock status.</li><li>Out-of-Stock Products Only - Display the enquiry button only for products that are currently unavailable or out of stock.</li></ul>',
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
        // This settings for notify me it works when only site off buying settings on and stock alert plugin active
        // popup - propopup, modulepopup
        {
            key: 'notify_me_button',
            type: 'checkbox',
            label: __('In-Stock notify me button', 'catalogx'),
            desc: __(
                'Allow customers to receive notifications when out-of-stock products become available.',
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
            settingDescription: __(
                'Choose how the enquiry form is presented to customers.',
                'catalogx'
            ),
            desc: __(
                '<ul><li>Popup Window - Open the enquiry form in a modal popup.</li><li>Inline on Product Page - Display the enquiry form directly within the product page.</li></ul>',
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
            type: 'choice-toggle',
            label: __('What happens after enquiry submission?', 'catalogx'),
            desc: __(
                '<ul><li>Stay on Current Page - Customers remain on the same page after submitting their enquiry.</li><li>Redirect to Another Page - Customers are redirected to a page of your choice, such as a thank-you page or contact page, after their enquiry is submitted.</li></ul>',
                'catalogx'
            ),
            settingDescription: __(
                'Choose whether customers remain on the current page or are redirected to another page after submitting an enquiry.',
                'catalogx'
            ),
            options: [
                {
                    key: 'current_page',
                    label: __('Stay on current page', 'catalogx'),
                    value: 'current_page',
                },
                {
                    key: 'dedicated_page',
                    label: __('Redirect to another page', 'catalogx'),
                    value: 'dedicated_page',
                },
            ],
            moduleEnabled: 'enquiry'
        },
        {
            key: 'redirect_page_id',
            type: 'select',
            label: __('Post enquiry submission redirect page', 'catalogx'),
            desc: __('Select page where user will be redirected after successful enquiry.', 'catalogx'),
            options: appLocalizer.pages_data,
            dependent: {
                key: 'is_page_redirect',
                set: true,
                value: 'dedicated_page',
            },
            moduleEnabled: 'enquiry'
        },
        {
            key: 'additional_alert_email',
            type: 'text',
            desc: __(
                "When a customer submits an enquiry for a product, the enquiry details will be sent to the email address(es) entered here. Add multiple email addresses separated by commas.<br/> <b>Default:</b> The site administrator's email is included by default. To stop the admin from receiving enquiry notifications, remove the admin email address from this list.",
                'catalogx'
            ),
            label: __('Recipient email for product enquiries', 'catalogx'),
            moduleEnabled: 'enquiry',
        },
        //quote
        {
            key: 'section',
            type: 'section',
            desc: __('Control who can request quotations and how long quotations remain available.',
                'catalogx'
            ),
            title: __('Quotation journey', 'catalogx'),
        },
        {
            key: 'quote_user_permission',
            type: 'choice-toggle',
            label: __(
                'Who can request quotations',
                'catalogx'
            ),
            settingDescription: __(
                'Control whether quotation requests are available to all visitors or only logged-in users.',
                'catalogx'
            ),
            desc: __(
                '<ul><li>Everyone - Any visitor can submit quotation requests.</li><li>Logged-in users - Only authenticated customers can request quotations.</li></ul>',
                'catalogx'
            ),
            options: [
                {
                    key: 'everyone',
                    label: __('Everyone', 'catalogx'),
                    value: 'everyone',
                },
                {
                    key: 'logged_in_only',
                    label: __('Logged-in users', 'catalogx'),
                    value: 'logged_in_only',
                },
            ],
            moduleEnabled: 'quote',
            tour: 'quote-permission',
        },

        {
            key: 'quotation_validity',
            type: 'choice-toggle',
            label: __('Quotation validity period', 'catalogx'),
            settingDescription: __(
                'Choose how long quotations remain valid before they expire.',
                'catalogx'
            ),
            desc: __(
                '<ul><li><strong>Lifetime</strong> – Quotations never expire automatically.</li><li><strong>Fixed duration</strong> – Quotations expire after the specified number of days.</li></ul>',
                'catalogx'
            ),
            options: [
                {
                    key: 'lifetime',
                    label: __('Lifetime', 'catalogx'),
                    value: 'lifetime',
                },
                {
                    key: 'fixed_duration',
                    label: __('Fixed duration', 'catalogx'),
                    value: 'fixed_duration',
                },
            ],
            proSetting: true,
            moduleEnabled: 'quote',
        },
        {
            key: 'set_expiry_time',
            type: 'number',
            label: __('Duration', 'catalogx'),
            size: 10,
            settingDescription: __(
                'Specify the number of days a quotation remains valid.',
                'catalogx'
            ),
            desc: __(
                'The quotation will automatically expire after the specified number of days from its creation.',
                'catalogx'
            ),
            postText: __('days', 'catalogx'),
            proSetting: true,
            moduleEnabled: 'quote',
            dependent: {
                key: 'quotation_validity',
                set: true,
                value: 'fixed_duration',
            },
        },
        //extra
        {
            key: 'section',
            type: 'section',
            desc: __('When a customer submits an enquiry or receives a quotation, choose whether a PDF should be available for download, attached to the email sent to them, or both.',
                'catalogx'
            ),
            title: __('How customers receives PDF documents?', 'catalogx'),
        },
        {
            key: 'display_pdf',
            type: 'multi-checkbox-table',
            storeSetting: true,
            label: __('PDF delivery mode', 'catalogx'),
            classes: 'gridTable',
            rows: [
                {
                    key: 'allow_download_pdf',
                    label: __('Available as download', 'catalogx'),
                },
                {
                    key: 'attach_pdf_to_email',
                    label: __('Attached to customer email', 'catalogx'),
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
