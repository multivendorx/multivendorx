import { __, sprintf } from '@wordpress/i18n';
import { CountryCodes } from '@zyra/core';

export default {
    id: 'customer-engagement',
    priority: 4,
    headerTitle: __('Enquiry & Quote', 'catalogx'),
    settingTitle: __('Purchase experience', 'catalogx'),
    headerDescription: __(
        'Define how customers move from product browsing to purchasing across your store.',
        'catalogx'
    ),
    groupBySections: true,
    hideSettingHeader: true,
    headerIcon: 'cart',
    submitUrl: 'settings',
    modal: [
        //shopping
        {
            key: 'section',
            type: 'section',
            icon: 'web-page-website',
            title: __('Who can enquire', 'catalogx'),
            desc: __(
                'Decide who sees the enquiry option and on which products.',
                'catalogx'
            ),
        },
        {
            key: 'enable_cart_checkout',
            type: 'choice-toggle',
            label: __('Store experience', 'catalogx'),
            settingDescription: __(
                'Choose whether customers can browse products as a catalog or purchase them through your store.',
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
            settingDescription: sprintf(
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
            key: 'enquiry_user_permission',
            type: 'choice-toggle',
            label: __(
                'Who can submit enquiries',
                'catalogx'
            ),
            settingDescription: __('Control whether enquiries are available to all visitors or only logged-in customers.',
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
        // popup - propopup, modulepopup
        {
            key: 'notify_me_button',
            type: 'checkbox',
            label: __('In-Stock notify me button', 'catalogx'),
            settingDescription: __(
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
            key: 'section',
            type: 'section',
            icon: 'web-page-website',
            title: __('Form behaviour', 'catalogx'),
            desc: __(
                `How the enquiry form is presented and what happens after it's sent.`,
                'catalogx'
            ),
        },
        {
            key: 'is_disable_popup',
            type: 'choice-toggle',
            label: __('Display enquiry form as', 'catalogx'),
            settingDescription: __(
                'A popup window, or inline on the product page.',
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
            settingDescription: __(
                'Keep the shopper on this page, or send them somewhere else.',
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
            settingDescription: __('Select page where user will be redirected after successful enquiry.', 'catalogx'),
            options: appLocalizer.pages_data,
            dependent: {
                key: 'is_page_redirect',
                set: true,
                value: 'dedicated_page',
            },
            moduleEnabled: 'enquiry'
        },
        {
            key: 'section',
            type: 'section',
            icon: 'web-page-website',
            title: __('Where enquiries are sent', 'catalogx'),
            desc: __(
                'Email and WhatsApp routing for incoming enquiries.',
                'catalogx'
            ),
        },
        {
            key: 'additional_alert_email',
            type: 'text',
            settingDescription: __(
                "Separate several addresses with commas. Your admin address is included by default.",
                'catalogx'
            ),
            label: __('Recipient email for product enquiries', 'catalogx'),
            moduleEnabled: 'enquiry',
        },
        //whatsapp section
        {
            key: 'enable_whatsapp',
            type: 'checkbox',
            label: __('Enable WhatsApp enquiries', 'catalogx'),
            settingDescription: __(
                'Allow customers to contact you directly through WhatsApp for product enquiries.',
                'catalogx'
            ),
            options: [
                {
                    key: 'enable_whatsapp',
                    label: __('', 'catalogx'),
                    value: 'enable_whatsapp',
                },
            ],
            look: 'toggle',
            moduleEnabled: 'enquiry',
            proSetting: true,

        },
        {
            key: 'whatsapp_number',
            type: 'text',
            size: 12,
            label: __('WhatsApp contact number', 'catalogx'),
            placeholder: __('9000012345', 'catalogx'),
            settingDescription: __(
                'The WhatsApp number that will receive product enquiries. Use country code followed by phone number.',
                'catalogx'
            ),
            beforeElement: {
                type: 'select',
                key: 'whatsapp_country_code',
                size: 12,
                options: CountryCodes,
            },
            dependent: {
                key: 'enable_whatsapp',
                set: true,
                value: 'enable_whatsapp',
            },
            moduleEnabled: 'enquiry',
            proSetting: true,
        },
        {
            key: 'whatsapp_message_template',
            type: 'textarea',
            label: __('WhatsApp enquiry message template', 'catalogx'),
            settingDescription: __(
                'Define the message that will be pre-filled when customers send a product enquiry through WhatsApp.',
                'catalogx'
            ),
            desc: __(
                'Use {site_name} to display the site name, {product_name} to display the product name, and {product_url} to display the product URL in the pre-filled message. You can edit the message text, but keep the placeholders if you want these details filled in automatically.',
                'catalogx'
            ),
            moduleEnabled: 'enquiry',
            proSetting: true,
            dependent: {
                key: 'enable_whatsapp',
                set: true,
                value: 'enable_whatsapp',
            },
        },
        //quote
        {
            key: 'section',
            type: 'section',
            icon: 'web-page-website',
            desc: __('Who can ask for a quote, and how long it stays valid.',
                'catalogx'
            ),
            title: __('Requests', 'catalogx'),
        },
        {
            key: 'quote_user_permission',
            type: 'choice-toggle',
            label: __(
                'Who can request quotations',
                'catalogx'
            ),
            settingDescription: __(
                'Anyone, or logged-in customers only.',
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
                'Quotes stand forever, or expire after a set number of days.',
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
            icon: 'web-page-website',
            desc: __('Configure how customers receive PDF documents for enquiries and quotations, including whether they can download them, receive them by email, or both.',
                'catalogx'
            ),
            title: __('How customers receives PDF documents?', 'catalogx'),
        },
        {
            key: 'display_pdf',
            type: 'multi-checkbox-table',
            storeSetting: true,
            label: __('PDF delivery mode', 'catalogx'),
            settingDescription: __('Select the preferred delivery method for generated PDF documents.',
                'catalogx'
            ),
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
