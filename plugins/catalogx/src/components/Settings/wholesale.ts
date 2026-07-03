import { __, sprintf } from '@wordpress/i18n';

export default {
    id: 'wholesale',
    priority: 4,
    headerTitle: __('Wholesale', 'catalogx'),
    headerDescription: __('Wholesale sign up and registration management.', 'catalogx'),
    headerIcon: 'wholesale',
    submitUrl: 'settings',
    modal: [
        {
            key: 'approve_wholesaler',
            type: 'choice-toggle',
            label: __(
                'Approval of wholesale users through registration form',
                'catalogx'
            ),
			settingDescription: __(
        'Choose how new wholesale users should be approved after registration.',
        'catalogx'
    ),
            desc: __(
                "Manual - Admin approves new wholesalers manually from 'Wholeseller Users' page. <br> Automatic - Instant wholesaler approval upon sign-up",
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
                'Choose how coupons work for wholesale customers.',
                'catalogx'
            ),
            desc: __(
                '<ul><li>Wholesale discount only - Wholesale discounts cannot be combined with coupons.</li><li>Wholesale discount + Coupons - Wholesale customers can apply coupons during checkout.</li></ul>',
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
            label: __('Wholesale Offer Visibility', 'catalogx'),
            settingDescription: __(
                'Choose how wholesale pricing is presented to regular customers.',
                'catalogx'
            ),
            desc: __(
                '<ul><li>Keep wholesale offers private - Display retail pricing without wholesale discounts.</li><li>Promote wholesale savings - Show potential wholesale pricing to encourage wholesale registrations.</li></ul>',
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
            key: 'enable_order_form',
            type: 'choice-toggle',
            label: __('Product browsing experience', 'catalogx'),
            settingDescription: __(
                'Choose how wholesale customers discover wholesale products.',
                'catalogx'
            ),
            desc: __(
                '<ul><li>Shared Product Catalog - Wholesale products appear within the regular catalog.</li><li>Dedicated Wholesale Catalog - Display all wholesale products on a dedicated page for wholesale customers.</li></ul>',
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
            key: 'enable_global_wholasale',
            type: 'choice-toggle',
            label: __('How wholesale pricing is managed', 'catalogx'),
            settingDescription: __(
        'Choose whether to set wholesale pricing for individual products or apply the same discount across all products.',
        'catalogx'
    ),
    desc: __(
        '<ul><li>Set prices for each product - Configure wholesale pricing separately for individual products.</li><li>Apply one discount to all products - Use a single discount rule for every wholesale product in your catalog.</li></ul>',
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
                key: 'enable_global_wholasale',
                set: true,
                value:'global_rule',
            },
        },
    ],
};
