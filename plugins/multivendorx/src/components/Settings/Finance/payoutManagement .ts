import { __ } from '@wordpress/i18n';

export default {
    id: 'payout-management',
    priority: 2,
    name: __( 'Disbursement', 'multivendorx' ),
    desc: __(
        "Tailor your marketplace's commission plan to fit your revenue-sharing preferences.",
        'multivendorx'
    ),
    icon: 'adminlib-dynamic-pricing',
    submitUrl: 'settings',
    modal: [
        {
            key: 'payment_schedule',
            type: 'setting-toggle',
            label: __( 'Payout Frequency', 'multivendorx' ),
            options: [
                {
                    key: 'mannual',
                    label: __( 'Mannual', 'multivendorx' ),
                    value: 'mannual',
                },
                {
                    key: 'weekly',
                    label: __( 'Weekly', 'multivendorx' ),
                    value: 'weekly',
                },
                {
                    key: 'daily',
                    label: __( 'Daily', 'multivendorx' ),
                    value: 'daily',
                },
                {
                    key: 'monthly',
                    label: __( 'Monthly', 'multivendorx' ),
                    value: 'monthly',
                },
                {
                    key: 'fortnightly',
                    label: __( 'Fortnightly', 'multivendorx' ),
                    value: 'fortnightly',
                },
                {
                    key: 'hourly',
                    label: __( 'Hourly', 'multivendorx' ),
                    value: 'hourly',
                },
            ],
        },
        {
            key: 'commission_threshold',
            type: 'number',
            label: __( 'Minimum Payout Threshold', 'multivendorx' ),
            desc: __(
                'Minimum balance before payout is processed',
                'multivendorx'
            ),
        },
        {
            key: 'separator_content',
            type: 'section',
            hint:__('Payout Timing & Eligibility','multivendorx'),
            desc:__('Define when earnings become available for payout based on order status','multivendorx')
        },
        {
            key: 'commission_by_product_price',
            type: 'nested',
            label: 'Withdrawal Rules',
            single:true,
            nestedFields: [
                {
                    key: 'commission_threshold_time',
                    type: 'number',
                    label: __( 'Lock Period', 'multivendorx' ),
                    desc: __(
                        'Days after order completion before earnings are eligible for payout',
                        'multivendorx'
                    ),
                    placeholder: __( 'in days', 'multivendorx' ),
                },
                {
                    key: 'no_of_orders',
                    type: 'number',
                    label: __( 'Free Withdrawal', 'multivendorx' ),
                    desc: __( 'Number of fee-free withdrawals per month.', 'multivendorx' ),
                },
                {
                    key: 'withdraw_fee',
                    type: 'number',
                    label: __( 'Processing Fee', 'multivendorx' ),
                    desc: __(
                        'Fixed fee per withdrawal (after free limit)',
                        'multivendorx'
                    ),
                },  
            ],
        },
        {
            key: 'order_status',
            type: 'checkbox',
            label: __( 'Eligible Order Statuses', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',

            options: [
                {
                    key: 'completed',
                    label: __( 'Completed', 'multivendorx' ),
                    value: 'completed',
                },
                {
                    key: ' delivered ',
                    label: __( ' Delivered ', 'multivendorx' ),
                    value: ' delivered ',
                },
                {
                    key: 'shipped',
                    label: __( 'Shipped', 'multivendorx' ),
                    value: 'shipped',
                },
                {
                    key: ' processing ',
                    label: __( 'Processing', 'multivendorx' ),
                    value: ' processing ',
                },
            ],
            selectDeselect: true,
        },
    ],
};
