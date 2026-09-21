import { __ } from '@wordpress/i18n';

export default {
    id: 'wholesale',
    priority: 5,
    headerTitle: __('Wholesale', 'catalogx'),
    headerDescription: __('Wholesale sign up and registration management.', 'catalogx'),
    headerIcon: 'wholesale',
    groupBySections: true,
    hideSettingHeader: true,
    submitUrl: 'settings',
    modal: [
        {
            key: 'section',
            type: 'section',
            icon: 'wholesale',
            title: __('Sign-up & offers', 'catalogx'),
            desc: __('How new wholesale buyers get approved, and how their offers are handled.', 'catalogx'),
        },
        {
            key: 'approve_wholesaler',
            type: 'choice-toggle',
            label: __(
                'Approval of wholesale users',
                'catalogx'
            ),
            settingDescription: __(
                'Review each signup yourself, or approve them the moment they register.',
                'catalogx'
            ),
            options: [
                {
                    key: 'manual',
                    label: __('Manual', 'catalogx'),
                    value: 'manual',
                },
                {
                    key: 'automatic',
                    label: __('Automatic', 'catalogx'),
                    value: 'automatic',
                },
            ],
            proSetting: true,
            moduleEnabled: 'wholesale',
        },
        {
            key: 'disable_coupon_for_wholesale',
            type: 'choice-toggle',
            label: __('How should coupons work with wholesale', 'catalogx'),
            settingDescription: __(
                'Let wholesale discounts stack with coupons, or keep them separate.',
                'catalogx'
            ),
            options: [
                {
                    key: 'restricted',
                    label: __('Wholesale discount only', 'catalogx'),
                    value: 'restricted',
                },
                {
                    key: 'allowed',
                    label: __('Wholesale discount + Coupons', 'catalogx'),
                    value: 'allowed',
                },
            ],
        },
        {
            key: 'show_wholesale_price',
            type: 'choice-toggle',
            label: __('Wholesale offer visibility', 'catalogx'),
            settingDescription: __(
                'Keep wholesale pricing private, or show it to regular shoppers to encourage sign-ups.',
                'catalogx'
            ),
            options: [
                {
                    key: 'hidden',
                    label: __('Keep wholesale offers private', 'catalogx'),
                    value: 'hidden',
                },
                {
                    key: 'visible',
                    label: __('Promote wholesale savings', 'catalogx'),
                    value: 'visible',
                },
            ],
            proSetting: true,
            look: 'toggle',
            moduleEnabled: 'wholesale',
        },
        {
            key: 'section',
            type: 'section',
            icon: 'wholesale',
            title: __('Catalog & pricing', 'catalogx'),
            desc: __('How wholesale products are browsed and priced.', 'catalogx'),
        },
        {
            key: 'enable_order_form',
            type: 'choice-toggle',
            label: __('Product browsing experience', 'catalogx'),
            settingDescription: __(
                'Show wholesale products inside the regular catalog, or on a dedicated page.',
                'catalogx'
            ),
            options: [
                {
                    key: 'shared',
                    label: __('Shared Product Catalog', 'catalogx'),
                    value: 'shared',
                },
                {
                    key: 'dedicated',
                    label: __('Dedicated Wholesale Catalog', 'catalogx'),
                    value: 'dedicated',
                },
            ],
            proSetting: true,
            look: 'toggle',
            moduleEnabled: 'wholesale',
        },
        {
            key: 'enable_global_wholesale',
            type: 'choice-toggle',
            label: __('How wholesale pricing is managed', 'catalogx'),
            settingDescription: __(
                'Set pricing per product, or apply one discount across everything.',
                'catalogx'
            ),
            options: [
                {
                    key: 'product_level',
                    label: __('Set prices for each product', 'catalogx'),
                    value: 'product_level',
                },
                {
                    key: 'global_rule',
                    label: __('Apply one discount to all products', 'catalogx'),
                    value: 'global_rule',
                },
            ],
            proSetting: true,
            look: 'toggle',
            moduleEnabled: 'wholesale',
        },
        {
            key: 'wholesale_amount',
            label: __('Discount rule', 'catalogx'),
            type: 'number',
            placeholder: 'Discount value',
            beforeElement: {
                key: 'wholesale_discount_type',
                type: 'select',
                options: [
                    {
                        value: 'fixed_amount',
                        label: 'Fixed Amount',
                    },
                    {
                        value: 'percentage_amount',
                        label: 'Percentage Amount',
                    },
                ],
            },
            afterElement: {
                key: 'minimum_quantity',
                type: 'number',
                placeholder: 'Minimum quantity',
            },
            moduleEnabled: 'wholesale',
            proSetting: true,
            dependent: {
                key: 'enable_global_wholesale',
                set: true,
                value: 'global_rule',
            },
        },
    ],
};
