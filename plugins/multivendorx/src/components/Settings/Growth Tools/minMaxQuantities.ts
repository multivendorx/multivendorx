import { __ } from '@wordpress/i18n';

export default {
    id: 'min-max',
    priority: 3,
    name: __( 'Min and Max Quantities', 'multivendorx' ),
    desc: __( 'Set purchase limits to control inventory and bulk ordering.', 'multivendorx' ),
    icon: 'adminlib-form-section',
    submitUrl: 'settings',
    modal: [
        {
            key: 'mvx_commission_rules_per_unit',
            type: 'multi-number',
            label: __( 'Global quantity rules', 'multivendorx' ),
            desc: __(
                'Define minimum and maximum purchase quantities for products.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'mvx_commission_percentage_per_unit',
                    label: __( 'Minimum quantity', 'multivendorx' ),
                    type: 'number',
                    desc: __(
                        'Set the lowest number of units a customer can order.',
                        'multivendorx'
                    ),
                },
                {
                    key: 'mvx_commission_fixed_per_unit',
                    label: __( 'Maximum quantity', 'multivendorx' ),
                    type: 'number',
                    desc: __(
                        'Set the highest number of units a customer can order.',
                        'multivendorx'
                    ),
                },
            ],
        },
    ],
};
