import { __ } from '@wordpress/i18n';

export default {
    id: 'store-appearance',
    priority: 1,
    name: __( 'Store Appearance', 'multivendorx' ),
    desc: __(
        "Control store branding, layout, and identity.",
        'multivendorx'
    ),
    icon: 'adminlib-clock2',
    submitUrl: 'settings',
    modal: [
        {
            key: 'vendor_url',
            type: 'text',
            desc: __(
                'Define the custom slug for the vendor store URL. For example, in the URL: https://yourdomain.com/store/[this-text]/[vendor-name], "[this-text]" will be replaced by the slug you set here.',
                'multivendorx'
            ),
            label: __('Vendor Store URL', 'multivendorx'),
        },
        {
            key: 'disable_setup_wizard',
            type: 'checkbox',
            label: __( 'Disable Wizard', 'multivendorx' ),
            desc: __(
                'Enable this to disable the setup wizard for vendors. When disabled, vendors will not be shown the onboarding steps after registration or login.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'disable_setup_wizard',
                    value: 'disable_setup_wizard',
                },
            ],
            look: 'toggle',
        },        
        {
            key: 'mvx_new_dashboard_site_logo',
            type: 'file',
            label: __( 'Branding Logo', 'multivendorx' ),
            width: 75,
            height: 75,
            desc: __( 'Upload brand image as logo', 'multivendorx' ),
        },
        {
            key: 'setup_wizard_introduction',
            type: 'textarea',
            label: __(
                'Vendor Setup wizard Introduction Message',
                'multivendorx'
            ),
            desc: __(
                'Welcome vendors with creative onboard messages',
                'multivendorx'
            ),
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
            key: 'store_sidebar_position',
            type: 'setting-toggle',
            label: __( 'Store Sidebar Position', 'multivendorx' ),
            desc: __( 'Choose whether the sidebar should appear on the left or right side of the vendor store page.', 'multivendorx' ),
            options: [
                {
                    key: 'left',
                    label: __( 'Left', 'multivendorx' ),
                    value: 'left',
                },
                {
                    key: 'right',
                    label: __( 'Right', 'multivendorx' ),
                    value: 'right',
                },
            ],
        }        
    ],
};
