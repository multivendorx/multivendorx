import { __ } from '@wordpress/i18n';

export default {
    id: 'store_colour_customization',
    priority: 2,
    name: __( 'Store Colour Customization', 'multivendorx' ),
    desc: __(
        "Control store branding, layout, and identity.",
        'multivendorx'
    ),
    icon: 'adminlib-clock2',
    submitUrl: 'settings',
    modal: [      
        {
            key: 'vendor_color_scheme_picker',
            type: 'radio-color',
            label: __( 'Color Scheme', 'multivendorx' ),
            desc: __(
                'Select your prefered seller dashboard colour scheme',
                'multivendorx'
            ),
            options: [
                {
                    key: 'outer_space_blue',
                    label: __( 'Outer Space', 'multivendorx' ),
                    value: 'outer_space_blue',
                    color: [ '#202528', '#333b3d', '#3f85b9', '#316fa8' ],
                },
                {
                    key: 'green_lagoon',
                    label: __( 'Green Lagoon', 'multivendorx' ),
                    value: 'green_lagoon',
                    color: [ '#171717', '#212121', '#009788', '#00796a' ],
                },
                {
                    key: 'old_west',
                    label: __( 'Old West', 'multivendorx' ),
                    value: 'old_west',
                    color: [ '#46403c', '#59524c', '#c7a589', '#ad8162' ],
                },
                {
                    key: 'wild_watermelon',
                    label: __( 'Wild Watermelon', 'multivendorx' ),
                    value: 'wild_watermelon',
                    color: [ '#181617', '#353130', '#fd5668', '#fb3f4e' ],
                },
                {
                    key: 'old_west',
                    label: __( 'Old West', 'multivendorx' ),
                    value: 'old_west',
                    color: [ '#46403c', '#59524c', '#c7a589', '#ad8162' ],
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
