import { __ } from '@wordpress/i18n';

export default {
    id: 'min-max',
    priority: 3,
    name: __( 'Min-Max Quantities', 'multivendorx' ),
    desc: __( 'Manage Min-Max Quantities/Amount', 'multivendorx' ),
    icon: 'adminlib-form-section',
    submitUrl: 'settings',
    modal: [
        {
            key: 'min_max_settings',
            type: 'checkbox',
            label: __( 'Min/Max Settings', 'multivendorx' ),
            desc: __( 'Choose the Min/Max rules you want to enable for products.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'enable_min_max_quantity',
                    label: __( 'Enable Min/Max Quantities', 'multivendorx' ),
                    value: 'enable_min_max_quantity',
                },
                {
                    key: 'enable_min_max_amount',
                    label: __( 'Enable Min/Max Amount', 'multivendorx' ),
                    value: 'enable_min_max_amount',
                },
            ],
            selectDeselect: true,
            moduleEnabled: 'min-max',
        },
        
    ],
};
