import { __ } from '@wordpress/i18n';

export default {
    id: 'order-actions-refunds',
    priority: 3,
    name: __( 'Order Actions & Refunds', 'multivendorx' ),
    desc: __(
        'Control what actions vendors can take regarding their orders and how order details are displayed.',
        'multivendorx'
    ),
    icon: 'adminlib-order',
    submitUrl: 'settings',
    modal: [
        {
            key: 'disallow_vendor_order_status',
            label: __( 'Order status control', 'multivendorx' ),
            type: 'checkbox',
            desc: __(
                'Decide whether vendors have the ability to change the status of their orders.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'disallow_vendor_order_status',
                    value: 'disallow_vendor_order_status',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'display_suborder_in_mail',
            label: __( 'Display suborder in mail', 'multivendorx' ),
            type: 'checkbox',
            desc: __(
                'Choose whether to include suborder numbers in order confirmation emails.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'display_suborder_in_mail',
                    value: 'display_suborder_in_mail',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'section',
            type: 'section',
        },
        {
            key: 'customer_refund_status',
            type: 'checkbox',
            label: __( 'Available Status for Refund', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            desc: __(
                'Customers would be able to avail a refund only if their order is at the following stage/s',
                'multivendorx'
            ),
            options: [
                {
                    key: 'pending',
                    label: __( 'Pending', 'multivendorx' ),
                    value: 'pending',
                },
                {
                    key: 'on-hold',
                    label: __( 'On hold', 'multivendorx' ),
                    value: 'on-hold',
                },
                {
                    key: 'processing',
                    label: __( 'Processing', 'multivendorx' ),
                    value: 'processing',
                },
                {
                    key: 'completed',
                    label: __( 'Completed', 'multivendorx' ),
                    value: 'completed',
                },
            ],
            selectDeselect: true,
            moduleEnabled: 'marketplace-refund',
        },
        {
            key: 'refund_days',
            type: 'number',
            label: __( 'Refund Claim Period (In Days)', 'multivendorx' ),
            desc: __(
                'The duration till which the refund request is available/valid',
                'multivendorx'
            ),
            max: 365,
            moduleEnabled: 'marketplace-refund',
        },
        {
            key: 'refund_order_msg',
            type: 'textarea',
            desc: __(
                'Add reasons for a refund. Use || to separate each reason. Options will appear as a radio button to customers.',
                'multivendorx'
            ),
            label: __( 'Reasons For Refund', 'multivendorx' ),
            moduleEnabled: 'marketplace-refund',
        },
        {
            key: 'disable_refund_customer_end',
            type: 'checkbox',
            label: __( 'Disable refund request for customer', 'multivendorx' ),
            desc: __(
                'Remove capability to customer from refund request.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'disable_refund_customer_end',
                    value: 'disable_refund_customer_end',
                },
            ],
            look: 'toggle',
            moduleEnabled: 'marketplace-refund',
        },
    ],
};
