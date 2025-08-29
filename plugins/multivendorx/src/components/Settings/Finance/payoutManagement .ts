import { __ } from '@wordpress/i18n';

export default {
    id: 'payout-management',
    priority: 2,
    name: __('Disbursement', 'multivendorx'),
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
            label: __('Payout Frequency', 'multivendorx'),
            options: [
                {
                    key: 'mannual',
                    label: __('Mannual', 'multivendorx'),
                    value: 'mannual',
                },
                {
                    key: 'weekly',
                    label: __('Weekly', 'multivendorx'),
                    value: 'weekly',
                },
                {
                    key: 'daily',
                    label: __('Daily', 'multivendorx'),
                    value: 'daily',
                },
                {
                    key: 'monthly',
                    label: __('Monthly', 'multivendorx'),
                    value: 'monthly',
                },
                {
                    key: 'fortnightly',
                    label: __('Fortnightly', 'multivendorx'),
                    value: 'fortnightly',
                },
                {
                    key: 'hourly',
                    label: __('Hourly', 'multivendorx'),
                    value: 'hourly',
                },
            ],
        },
        {
            key: 'commission_threshold',
            type: 'multi-number',
            label: __('Minimum Payout Threshold', 'multivendorx'),
            desc: __(
                'Minimum balance before payout is processed',
                'multivendorx'
            ),
            options: [
                {
                    key: 'commission_percentage',
                    label: __('Min', 'multivendorx'),
                    type: 'number',
                    labelAfterInput: true,
                },
            ],
        },
        {
            key: 'separator_content',
            type: 'section',
            hint: __('Payout Timing & Eligibility', 'multivendorx'),
            desc: __('Define when earnings become available for payout based on order status', 'multivendorx')
        },
        {
            key: 'commission_by_product_price',
            type: 'nested',
            single: true,
            label: 'Withdrawal Rules',
            nestedFields: [
                {
                    key: 'commission_threshold_time',
                    type: 'multi-number',
                    label: __('Lock Period', 'multivendorx'),
                    options: [
                        {
                            key: 'commission_percentage',
                            label: __('days', 'multivendorx'),
                            type: 'number',
                            labelAfterInput: true,
                        },
                    ],
                },
                {
                    key: 'commission_threshold_time',
                    type: 'multi-number',
                    label: __('Free Withdrawal', 'multivendorx'),
                    options: [
                        {
                            key: 'commission_percentage',
                            type: 'number',
                        },
                    ],
                },
                {
                    key: 'commission_threshold_time',
                    type: 'multi-number',
                    label: __('Processing Fee', 'multivendorx'),
                    options: [
                        {
                            key: 'commission_percentage',
                            type: 'number',
                        },
                    ],
                },
            ],
        },
        {
            key: 'order_status',
            type: 'checkbox',
            label: __('Eligible Order Statuses', 'multivendorx'),
            class: 'mvx-toggle-checkbox',

            options: [
                {
                    key: 'completed',
                    label: __('Completed', 'multivendorx'),
                    value: 'completed',
                },
                {
                    key: ' delivered ',
                    label: __(' Delivered ', 'multivendorx'),
                    value: ' delivered ',
                },
                {
                    key: 'shipped',
                    label: __('Shipped', 'multivendorx'),
                    value: 'shipped',
                },
                {
                    key: ' processing ',
                    label: __('Processing', 'multivendorx'),
                    value: ' processing ',
                },
            ],
            selectDeselect: true,
        },
    ],
};
