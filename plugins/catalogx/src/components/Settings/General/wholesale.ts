import { __, sprintf } from '@wordpress/i18n';

export default {
    id: 'wholesale',
    priority: 4,
    name: __( 'Wholesale', 'catalogx' ),
    desc: __( 'Wholesale sign up and registration management.', 'catalogx' ),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        {
            key: 'approve_wholesaler',
            type: 'setting-toggle',
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
                    label: __( 'Manual', 'catalogx' ),
                    value: 'manual',
                },
                {
                    key: 'automatic',
                    label: __( 'Automatic', 'catalogx' ),
                    value: 'automatic',
                },
            ],
            proSetting: true,
            moduleEnabled: 'wholesale',
        },
        {
            key: 'disable_coupon_for_wholesale',
            type: 'checkbox',
            label: __( 'Coupon restriction for wholesalers', 'catalogx' ),
            desc: __(
                'Prevent wholesale users from applying any coupon and get addional discount on their orders.',
                'catalogx'
            ),
            options: [
                {
                    key: 'disable_coupon_for_wholesale',
                    label: __( '', 'catalogx' ),
                    value: 'disable_coupon_for_wholesale',
                },
            ],
            proSetting: true,
            look: 'toggle',
            moduleEnabled: 'wholesale',
        },
        {
            key: 'show_wholesale_price',
            type: 'checkbox',
            label: __(
                'Promote wholesale discounts to non-wholesale users',
                'catalogx'
            ),
            desc: __(
                'Display discounted prices on product pages to entice regular customers into becoming wholesalers.',
                'catalogx'
            ),
            options: [
                {
                    key: 'show_wholesale_price',
                    label: __( '', 'catalogx' ),
                    value: 'show_wholesale_price',
                },
            ],
            proSetting: true,
            look: 'toggle',
            moduleEnabled: 'wholesale',
        },
        {
            key: 'enable_order_form',
            type: 'checkbox',
            label: __( 'Dedicated wholesale-only product list', 'catalogx' ),
            desc: __(
                'Enables a dedicated wholesale-only page displaying all wholesale products for easy browsing and single-click checkout by logged-in wholesalers.',
                'catalogx'
            ),
            options: [
                {
                    key: 'enable_order_form',
                    label: __( '', 'catalogx' ),
                    value: 'enable_order_form',
                },
            ],
            proSetting: true,
            look: 'toggle',
            moduleEnabled: 'wholesale',
        },
        {
            key: 'enable_global_wholasale',
            type: 'checkbox',
            label: __( 'Global wholesale discount', 'catalogx' ),
            desc: sprintf(
                /* translators: %s will be replaced with a link to wholeslale document */
                __(
                    'Automatically mark all products on your site as wholesale items, making them available for bulk purchases. You can configure the wholesale rates below to apply site-wide or set specific wholesale prices for individual products as needed. To know more %s.',
                    'catalogx'
                ),
                '<a href="https://catalogx.com/docs/wholesale-pricing/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx" target="_blank">click here</a>'
            ),
            options: [
                {
                    key: 'enable_global_wholasale',
                    label: __( '', 'catalogx' ),
                    value: 'enable_global_wholasale',
                },
            ],
            proSetting: true,
            look: 'toggle',
            moduleEnabled: 'wholesale',
        },
        {
            key: 'wholesale_discount',
            type: 'merge-component',
            label: __( 'Discount rule', 'catalogx' ),
            desc: __(
                '<b>Bulk Discount Configuration: </b> Set discount type (percentage/fixed), discount amount, and minimum quantity for wholesellers',
                'catalogx'
            ),
            proSetting: true,
            dependent: {
                key: 'enable_global_wholasale',
                set: true,
            },
            fields: [
                {
                    name: 'wholesale_discount_type',
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
                {
                    name: 'wholesale_amount',
                    type: 'number',
                    placeholder: 'Discount value',
                },
                {
                    name: 'minimum_quantity',
                    type: 'number',
                    placeholder: 'Minimum quantity',
                },
            ],
            moduleEnabled: 'wholesale',
        },
    ],
};
