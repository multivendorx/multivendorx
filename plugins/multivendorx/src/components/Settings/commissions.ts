import { __ } from '@wordpress/i18n';

export default {
    id: 'commissions',
    priority: 8,
    name: __( 'Commission', 'multivendorx' ),
    desc: __(
        "Tailor your marketplace's commission plan to fit your revenue-sharing preferences.",
        'multivendorx'
    ),
    icon: 'adminlib-dynamic-pricing',
    submitUrl: 'settings',
    modal: [
        {
            key: 'revenue_sharing_mode',
            type: 'setting-toggle',
            label: 'Revenue Sharing Mode',
            desc: 'Select how you want the commission to be split. If you are not sure about how to setup commissions and payment options in your marketplace, kindly read this <a href="https://multivendorx.com/doc/knowladgebase/payments/" target="_blank">article</a> before proceeding.',
            options: [
                {
                    key: 'revenue_sharing_mode_admin',
                    label: 'Admin fees',
                    value: 'revenue_sharing_mode_admin',
                },
                {
                    key: 'revenue_sharing_mode_seller',
                    label: 'Seller commissions',
                    value: 'revenue_sharing_mode_seller',
                },
            ],
        },
        {
            key: 'commission_type',
            type: 'select',
            label: __( 'Commission Type', 'multivendorx' ),
            desc: __(
                'Choose the type of commission structure that best fits your marketplace model.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'commission_type_fixed',
                    label: __( 'Fixed Amount', 'multivendorx' ),
                    value: __( 'commission_type_fixed', 'multivendorx' ),
                },
                {
                    key: 'commission_type_category',
                    label: __( 'Category Based', 'multivendorx' ),
                    value: __( 'commission_type_category', 'multivendorx' ),
                },
            ],
        },
        {
            key: 'mvx_commission_rules_per_transaction',
            type: 'multi-number',
            label: __( 'Commission Value', 'multivendorx' ),
            desc: __(
                'This is the default commission amount that will be applicable for all transactions.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'mvx_commission_fixed_per_transaction',
                    label: __( 'Fixed', 'multivendorx' ),
                    type: 'number',
                    desc: __( 'Fixed amount per transaction', 'multivendorx' ),
                },
                {
                    key: 'mvx_commission_percentage_per_transaction',
                    label: __( 'Percentage', 'multivendorx' ),
                    type: 'number',
                    desc: __(
                        'Percentage of product price per transaction',
                        'multivendorx'
                    ),
                },
            ],
            dependent: {
                key: 'commission_type',
                set: true,
                value: 'commission_type_fixed',
            },
        },
        {
            key: 'apply_parent_category_commission',
            label: __( 'Apply Parent Category Commission to All Subcategories', 'multivendorx' ),
            desc: __(
                'Important: "All Categories" commission serves as your marketplace\'s default rate and cannot be empty. If 0 is given as the value, then the marketplace will deduct no commission from vendors.',
                'multivendorx'
            ),
            type: 'checkbox',
            options: [
                {
                    key: 'apply_parent_category_commission',
                    value: 'apply_parent_category_commission',
                },
            ],
            dependent: {
                key: 'commission_type',
                set: true,
                value: 'commission_type_category',
            },
            look: 'toggle',
        },        
        {
            key: 'category_commission_rates',
            label: __( 'Category Wise Commission Rates', 'multivendorx' ),
            desc: __(
                'Set commission rates for all categories or define individual rates for each category and its subcategories.',
                'multivendorx'
            ),
            type: 'categorycommissioninput',
            categories: [
                // Parent Categories
                { id: 1, name: 'Clothing', parent: 0 },
                { id: 2, name: 'Electronics', parent: 0 },
                { id: 3, name: 'Home & Kitchen', parent: 0 },
        
                // Subcategories for Clothing
                { id: 11, name: 'Men', parent: 1 },
                { id: 12, name: 'Women', parent: 1 },
                { id: 13, name: 'Kids', parent: 1 },
        
                // Subcategories for Electronics
                { id: 21, name: 'Mobiles', parent: 2 },
                { id: 22, name: 'Laptops', parent: 2 },
                { id: 23, name: 'Cameras', parent: 2 },
        
                // Subcategories for Home & Kitchen
                { id: 31, name: 'Furniture', parent: 3 },
                { id: 32, name: 'Decor', parent: 3 },
            ],
            dependent: {
                key: 'commission_type',
                set: true,
                value: 'commission_type_category',
            },
            proSetting: false,
        },        
        {
            key: 'product_wise_commission',
            label: __( 'Product Wise Commission', 'multivendorx' ),
            desc: __(
                'Enable commission settings on a per-product basis. Set individual commission rates per product.',
                'multivendorx'
            ),
            type: 'checkbox',
            options: [
                {
                    key: 'product_wise_commission',
                    value: 'product_wise_commission',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'vendor_wise_commission',
            label: __( 'Vendor Wise Commission', 'multivendorx' ),
            desc: __(
                'Enable commission settings per vendor. Assign commission rates to specific vendors.',
                'multivendorx'
            ),
            type: 'checkbox',
            options: [
                {
                    key: 'vendor_wise_commission',
                    value: 'vendor_wise_commission',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'category_wise_commission',
            label: __( 'Category Wise Commission', 'multivendorx' ),
            desc: __(
                'Enable commission settings based on product categories. Set different commission rates per category.',
                'multivendorx'
            ),
            type: 'checkbox',
            options: [
                {
                    key: 'category_wise_commission',
                    value: 'category_wise_commission',
                },
            ],
            look: 'toggle',
        },        
        {
            key: 'payment_method_disbursement',
            label: __( 'Commission Disbursement Method', 'multivendorx' ),
            desc: __(
                `Decide how vendors will receive their commissions, such as via Stripe, PayPal, or Bank Transfer. This setting determines the method through which payments are processed and transferred to your vendors. <li>Important: Kindly activate your preferred payment method in the <a href="${ appLocalizer.modules_page_url }">Module section</a>`,
                'multivendorx'
            ),
            type: 'checkbox',
            right_content: true,
            options: [],
        },
        {
            key: 'separator_content',
            type: 'section',
        },
        {
            key: 'payment_gateway_charge',
            label: __( 'Payment Gateway Charge', 'multivendorx' ),
            desc: __(
                'Include any additional fees charged by the payment gateway during online transactions.',
                'multivendorx'
            ),
            type: 'checkbox',
            options: [
                {
                    key: 'payment_gateway_charge',
                    label: __( '', 'multivendorx' ),
                    value: 'payment_gateway_charge',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'gateway_charges_cost_carrier',
            type: 'select',
            label: __( 'Gateway charges responsibility', 'multivendorx' ),
            desc: __(
                'Decide who will bear the payment gateway charges (e.g., admin or vendor) when making automated payment',
                'multivendorx'
            ),
            options: [
                {
                    key: 'vendor',
                    label: __( 'Vendor', 'multivendorx' ),
                    value: __( 'vendor', 'multivendorx' ),
                },
                {
                    key: 'admin',
                    label: __( 'Site owner', 'multivendorx' ),
                    value: __( 'admin', 'multivendorx' ),
                },
                {
                    key: 'separate',
                    label: __( 'Separately', 'multivendorx' ),
                    value: __( 'separate', 'multivendorx' ),
                },
            ],
            dependent: {
                key: 'payment_gateway_charge',
                set: true,
            },
        },
        {
            key: 'payment_gateway_charge_type',
            type: 'select',
            label: __( 'Gateway charge structure', 'multivendorx' ),
            desc: __(
                'Choose how payment gateway fees will be calculated.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'percent',
                    label: __( 'Percentage', 'multivendorx' ),
                    value: 'percent',
                },
                {
                    key: 'fixed',
                    label: __( 'Fixed amount', 'multivendorx' ),
                    value: 'fixed',
                },
                {
                    key: 'fixed_with_percentage',
                    label: __( '%age + Fixed', 'multivendorx' ),
                    value: 'fixed_with_percentage',
                },
            ],
            dependent: {
                key: 'payment_gateway_charge',
                set: true,
            },
        },
        // gayeway charge value
        {
            key: 'default_gateway_charge_value',
            type: 'multi-number',
            label: __( 'Gateway charge value', 'multivendorx' ),
            desc: __(
                'Set specific values for gateway fees based on the selected charge structure.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'fixed_gayeway_amount_paypal_masspay',
                    type: 'number',
                    label: __( 'Fixed paypal masspay amount', 'multivendorx' ),
                    value: 'fixed_gayeway_amount_paypal_masspay',
                },
            ],
            dependent: {
                key: 'payment_gateway_charge_type',
                value: 'fixed',
            },
        },
        {
            key: 'default_gateway_charge_value',
            type: 'multi-number',
            label: __( 'Gateway Value', 'multivendorx' ),
            desc: __(
                'The commission amount added here will be applicable for all commissions. In case the your commission type is fixed the',
                'multivendorx'
            ),
            options: [
                {
                    key: 'percent_gayeway_amount_paypal_masspay',
                    type: 'number',
                    label: __(
                        'Percent paypal masspay amount',
                        'multivendorx'
                    ),
                    value: 'percent_gayeway_amount_paypal_masspay',
                },
            ],
            dependent: {
                key: 'payment_gateway_charge_type',
                value: 'percent',
            },
        },
        {
            key: 'default_gateway_charge_value',
            type: 'multi-number',
            label: __( 'Gateway Value', 'multivendorx' ),
            desc: __(
                'The commission amount added here will be applicable for all commissions. In case the your commission type is fixed the',
                'multivendorx'
            ),
            options: [
                {
                    key: 'fixed_gayeway_amount_paypal_masspay',
                    type: 'number',
                    label: __( 'Fixed paypal masspay amount', 'multivendorx' ),
                    value: 'fixed_gayeway_amount_paypal_masspay',
                },
                {
                    key: 'percent_gayeway_amount_paypal_masspay',
                    type: 'number',
                    label: __(
                        'Percent paypal masspay amount',
                        'multivendorx'
                    ),
                    value: 'percent_gayeway_amount_paypal_masspay',
                },
            ],
            dependent: {
                key: 'payment_gateway_charge_type',
                value: 'fixed_with_percentage',
            },
        },
    ],
};
