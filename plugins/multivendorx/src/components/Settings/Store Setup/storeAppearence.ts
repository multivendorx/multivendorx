import { __ } from '@wordpress/i18n';

export default {
    id: 'store-appearance',
    priority: 3,
    name: __( 'Store Appearance', 'multivendorx' ),
    desc: __(
        "Control store branding, layout, and identity.",
        'multivendorx'
    ),
    icon: 'adminlib-clock2',
    submitUrl: 'settings',
    modal: [
        {
            key: 'mvx_new_dashboard_site_logo',
            type: 'file',
            label: __( 'Branding Logo', 'multivendorx' ),
            width: 75,
            height: 75,
            desc: __( 'Upload brand image as logo', 'multivendorx' ),
        },
        {
            key: 'enable_store_category',
            type: 'checkbox',
            label: __( 'Store Category', 'multivendorx' ),
            desc: __( 'Enable this to allow grouping of vendor stores by category.', 'multivendorx' ),
            options: [
                {
                    key: 'enable_store_category',
                    value: 'enable_store_category',
                },
            ],
            look: 'toggle',
        },        
        {
            key: 'mvx_vendor_shop_template',
            type: 'radio-select',
            label: __( 'Store header', 'multivendorx' ),
            desc: __(
                'Select a banner style for your vendors’ store headers. This allows you to choose how vendor stores will visually appear on the platform.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'template1',
                    label: __( 'Outer Space', 'multivendorx' ),
                    value: 'template1',
                    color: appLocalizer.template1,
                },
                {
                    key: 'template2',
                    label: __( 'Green Lagoon', 'multivendorx' ),
                    value: 'template2',
                    color: appLocalizer.template2,
                },
                {
                    key: 'template3',
                    label: __( 'Old West', 'multivendorx' ),
                    value: 'template3',
                    color: appLocalizer.template3,
                },
            ],
        },
        {
            key: 'enable_store_sidebar',
            type: 'checkbox',
            label: __( 'Store Sidebar', 'multivendorx' ),
            desc: __( 'Enable this to show the sidebar on vendor store pages.', 'multivendorx' ),
            options: [
                {
                    key: 'enable_store_sidebar',
                    value: 'enable_store_sidebar',
                },
            ],
            look: 'toggle',
        },

        {
            key: 'vendor_color_settings',
            type: 'color-setting',
            label: 'Colors Settings',
            desc: 'You can configure your general site settings with the option to adjust the color of your dashboard.',
            showPreview: true,
            predefinedOptions: [
                {
                    key: 'purple_pulse',
                    label: 'Purple Pulse',
                    value: 'purple_pulse',
                    color: ['#3c1f5d', '#5a2d82', '#7b3eb8', '#9e64d9'],
                },
                {
                    key: 'majestic_orange',
                    label: 'Majestic Orange',
                    value: 'majestic_orange',
                    color: ['#ff9f1a', '#ff6f00', '#ff8533', '#e65100'],
                },
                {
                    key: 'ocean',
                    label: 'Ocean',
                    value: 'ocean',
                    color: ['#102a43', '#243b53', '#2c5282', '#2b6cb0'],
                },
            ],
        },             
        {
            key: 'mvx_vendor_dashboard_custom_css',
            type: 'textarea',
            label: __( 'Custom CSS', 'multivendorx' ),
            desc: __(
                'Apply custom CSS to change dashboard design',
                'multivendorx'
            ),
        },  
    ],
};
