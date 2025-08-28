import { __ } from '@wordpress/i18n';

export default {
    id: 'marketplace-settings',
    priority: 1,
    name: __( 'Marketplace', 'multivendorx' ),
    desc: __(
        'Controls how stores are onboarded and what access they get.',
        'multivendorx'
    ),
    video: {
        icon: 'adminlib-general-tab', // optional icon class
        link: 'https://example.com/video/general-settings',
    },
    docs: {
        icon: 'adminlib-general-tab', // optional icon class
        link: 'https://example.com/docs/general-settings',
    },
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [    
        // {
        //     key: 'store_url',
        //     type: 'range',
        //     desc: __(
        //         'Define the custom slug for the store URL. For example, in the URL: https://yourdomain.com/store/[this-text]/[store-name], "[this-text]" will be replaced by the slug you set here.',
        //         'multivendorx'
        //     ),
        //     min:0,
        //     max:100,
        //     label: __( 'Store URL', 'multivendorx' ),
        // }, 
        {
            key: 'store_registration_page',
            type: 'select',
            label: __( 'Store registration page', 'multivendorx' ),
            desc: __(
                'Select the page where you have inserted the <code>[store_registration]</code> shortcode. This page will be used to onboard new stores.',
                'multivendorx'
            ),
            className:"select-class",
            options: appLocalizer.pages_list,
        },
        {
            key: 'store_dashboard_page',
            type: 'select',
            label: __( 'Store dashboard page', 'multivendorx' ),
            desc: __(
                'Select the page on which you have inserted <code>[mvx_store]</code> shortcode. This will be the main dashboard page for your vendors to manage their store.',
                'multivendorx'
            ),
            options: appLocalizer.pages_list,
        },
        {
            key: 'store_url',
            type: 'text',
            desc: __(
                'Define the custom slug for the store URL. For example, in the URL: https://yourdomain.com/store/[this-text]/[store-name], "[this-text]" will be replaced by the slug you set here.',
                'multivendorx'
            ),
            label: __( 'Store URL', 'multivendorx' ),
        },
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Enable content styling tools for vendors',
                'multivendorx'
            ),
        },
        {
            key: 'mvx_tinymce_api_section',
            type: 'text',
            label: __( 'Tinymce API', 'multivendorx' ),
            desc: __(
                'To enable styling tools (rich text editing) <a href="https://www.tiny.cloud/blog/how-to-get-tinymce-cloud-up-in-less-than-5-minutes/" target="_blank">get the API key</a> and paste it here.<br> This allows them to format their product descriptions and other content with ease.',
                'multivendorx'
            ),
        },
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Shortcode library',
                'multivendorx'
            ),
        },
        {
            key: 'available_shortcodes',
            type: 'shortcode-table',
            label: __( 'Available shortcodes', 'multivendorx' ),
            desc: __( '', 'multivendorx' ),
            optionLabel: [ 'Shortcodes', 'Description' ],
            icon: 'adminlib-general-tab',
            options: [
                {
                    key: '',
                    label: '[mvx_store]',
                    desc: __(
                        'Enables you to create a store dashboard.',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[store_registration]',
                    desc: __(
                        'Creates a page where the store registration form is available.',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[store_coupons]',
                    desc: __(
                        'Lets you view a brief summary of the coupons created by the store and the number of times they have been used by customers.',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[mvx_recent_products]',
                    desc: __(
                        'Allows you to view recent products added by the store.',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[mvx_products]',
                    desc: __(
                        'Displays the products added by the store.',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[mvx_featured_products]',
                    desc: __(
                        'Shows featured products added by the store.',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[mvx_sale_products]',
                    desc: __(
                        'Allows you to see products put on sale by the store.',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[mvx_top_rated_products]',
                    desc: __(
                        'Displays the top-rated products of the store.',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[mvx_best_selling_products]',
                    desc: __(
                        'Allows you to view the best-selling products of the vendor.',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[mvx_product_category]',
                    desc: __(
                        'Shows the product categories used by the vendor.',
                        'multivendorx'
                    ),
                },
                {
                    key: '',
                    label: '[mvx_vendorslist]',
                    desc: __(
                        'Shows customers a list of available stores.',
                        'multivendorx'
                    ),
                },
            ],
        },
    ],
};
