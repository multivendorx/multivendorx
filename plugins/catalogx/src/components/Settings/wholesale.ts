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
            key: 'wholesale_coupon_policy',
            type: 'choice-toggle',
            label: __('Coupon usage', 'catalogx'),
            settingDescription: __(
                'Choose how coupons work for wholesale customers.',
                'catalogx'
            ),
            desc: __(
                '<ul><li>Wholesale Pricing Only - Wholesale discounts cannot be combined with coupons.</li><li>Wholesale Pricing + Coupons - Wholesale customers can apply coupons during checkout.</li></ul>',
                'catalogx'
            ),
            options: [
                {
                    key: 'restricted',
                    label: __('Wholesale Pricing Only', 'catalogx'),
                    value: 'restricted',
                },
                {
                    key: 'allowed',
                    label: __('Wholesale Pricing + Coupons', 'catalogx'),
                    value: 'allowed',
                },
            ],
        },
        // {
        //     key: 'disable_coupon_for_wholesale',
        //     type: 'checkbox',
        //     label: __( 'Coupon restriction for wholesalers', 'catalogx' ),
        //     desc: __(
        //         'Prevent wholesale users from applying any coupon and get addional discount on their orders.',
        //         'catalogx'
        //     ),
        //     options: [
        //         {
        //             key: 'disable_coupon_for_wholesale',
        //             label: __( '', 'catalogx' ),
        //             value: 'disable_coupon_for_wholesale',
        //         },
        //     ],
        //     proSetting: true,
        //     look: 'toggle',
        //     moduleEnabled: 'wholesale',
        // },
        {
            key: 'show_wholesale_price',
            type: 'choice-toggle',
            label: __('Wholesale savings display', 'catalogx'),
            settingDescription: __(
                'Choose how wholesale pricing is presented to regular customers.',
                'catalogx'
            ),
            desc: __(
                '<ul><li>Standard Pricing Only - Display retail pricing without wholesale discounts.</li><li>Display Wholesale Savings - Show potential wholesale pricing to encourage wholesale registrations.</li></ul>',
                'catalogx'
            ),
            options: [
                {
                    key: 'hidden',
                    label: __('Standard Pricing Only', 'catalogx'),
                    value: 'hidden',
                },
                {
                    key: 'visible',
                    label: __('Display Wholesale Savings', 'catalogx'),
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
            label: __('Wholesale pricing method', 'catalogx'),
            settingDescription: __(
                'Choose how wholesale pricing is applied across your catalog.',
                'catalogx'
            ),
            desc: __(
                '<ul><li>Product-Level Pricing - Configure wholesale pricing individually for each product.</li><li>Storewide Discount Rule - Apply a single wholesale pricing rule across all eligible products.</li></ul>',
                'catalogx'
            ),
            options: [
                {
                    key: 'product_level',
                    label: __('Product-Level Pricing', 'catalogx'),
                    value: 'product_level',
                },
                {
                    key: 'global_rule',
                    label: __('Storewide Discount Rule', 'catalogx'),
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
            },
        },
    ],
};
