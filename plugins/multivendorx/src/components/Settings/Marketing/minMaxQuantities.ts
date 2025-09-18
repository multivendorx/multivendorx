import { __ } from '@wordpress/i18n';

export default {
    id: 'min-max',
    priority: 3,
    name: __('Min and Max Quantities', 'multivendorx'),
    desc: __('Set purchase limits to control inventory and bulk ordering.', 'multivendorx'),
    icon: 'adminlib-form-section',
    submitUrl: 'settings',
    modal: [
        {
            key: 'mvx_commission_rules_per_unit',
            type: 'nested',
            label: __('Global quantity rules', 'multivendorx'),
            single: true,
            settingDescription: __(
                'Control the minimum and maximum number of units a customer is allowed to purchase for each product.',
                'multivendorx'
            ),
            nestedFields: [
                {
                    key: 'mvx_commission_percentage_per_unit',
                    preInsideText: __('Min', 'multivendorx'),
                    type: 'number',
                },
                {
                    key: 'mvx_commission_fixed_per_unit',
                    preInsideText: __('Max', 'multivendorx'),
                    type: 'number',
                },
            ],
        },
    ],
};
