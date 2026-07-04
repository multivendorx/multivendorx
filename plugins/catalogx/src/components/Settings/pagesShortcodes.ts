import { __ } from '@wordpress/i18n';

export default {
    id: 'pages-shortcodes',
    priority: 1,
    headerTitle: __('Pages & Shortcodes', 'catalogx'),
    headerDescription: __(
        'Manage the endpoints for all pages on the site, ensuring proper routing and access.',
        'catalogx'
    ),
    headerIcon: 'web-page-website',
    submitUrl: 'settings',
    modal: [
        {
            key: 'set_enquiry_cart_page',
            type: 'select',
            label: __('Set Enquiry Cart Page', 'catalogx'),
            size: 20,
            desc: __(
                'Select the page on which you have inserted <code>[catalogx_enquiry_cart]</code> shortcode.',
                'catalogx'
            ),
            options: appLocalizer.pages_data,
            proSetting: true,
        },
        {
            key: 'set_request_quote_page',
            type: 'select',
            label: __('Set Request Quote Page', 'catalogx'),
            size: 20,
            desc: __(
                'Select the page on which you have inserted <code>[request_quote]</code> shortcode.',
                'catalogx'
            ),
            options: appLocalizer.pages_data,
            proSetting: true,
        },
        {
            key: 'set_wholesale_products_page',
            type: 'select',
            size: 20,
            label: __('Set Wholesale Products Page', 'catalogx'),
            desc: __(
                'Select the page on which you have inserted <code>[catalogx_wholesale_products]</code> shortcode.',
                'catalogx'
            ),
            options: appLocalizer.pages_data,
            proSetting: true,
        },
        {
            key: 'section',
            type: 'section',
            title: __('Shortcode library', 'catalogx'),
        },
        {
            key: 'shortCode',
            type: 'shortcode-table',
            label: __('Available Shortcodes', 'catalogx'),
            desc: __('', 'catalogx'),
            optionLabel: [
                __('Shortcodes and block', 'catalogx'),
                __('Description', 'catalogx'),
                __('Arguments', 'catalogx'),
                __('Example usage', 'catalogx'),
            ],
            options: [
                {
                    key: '',
                    label: '[catalogx_enquiry_cart]',
                    name: 'Enquiry Cart Page',
                    desc: __(
                        'Let users review all enquiry cart items and send a single enquiry for multiple products.',
                        'catalogx'
                    ),
                },
                {
                    key: '',
                    label: '[catalogx_request_quote]',
                    name: 'Display Quote Cart',
                    desc: __(
                        'Let users review their selected products and submit a quotation request.',
                        'catalogx'
                    ),
                },
                {
                    key: '',
                    label: '[catalogx_enquiry_cart_button]',
                    name: 'Add to Enquiry Cart',
                    desc: __(
                        'Provide approved wholesale users with a dedicated page to browse and purchase wholesale products.',
                        'catalogx'
                    ),
                },
                {
                    key: '',
                    label: '[catalogx_wholesale_products]',
                    name: 'Display Wholesale Products',
                    desc: __(
                        'Allow users to add products to an enquiry cart and send a combined enquiry.',
                        'catalogx'
                    ),
                },
                {
                    key: '',
                    label: '[catalogx_enquiry_button]',
                    name: 'Display Enquiry Cart Button',
                    desc: __(
                        'Displays the "Send an Enquiry" button for specific products',
                        'catalogx'
                    ),
                    arguments: [
                        {
                            attribute: 'product_id',
                            accepted: 'product_id',
                            default: '[catalogx_enquiry_button product_id="4"]',
                            description: __('Specify the product ID for which the enquiry button should be displayed.', 'catalogx'),
                        }
                    ],
                },
                {
                    key: '',
                    label: '[catalogx_quote_button]',
                    name: 'Show Quote Button',
                    desc: __(
                        'Displays the "Add to Quote" button for specific products.',
                        'catalogx'
                    ),
                    arguments: [
                        {
                            attribute: 'product_id',
                            accepted: 'product_id',
                            default: '[catalogx_quote_button product_id="4"]',
                            description: __('Specify the product ID for which the quote button should be displayed.', 'catalogx'),
                        }
                    ],
                },
            ],
        },
    ],
};
