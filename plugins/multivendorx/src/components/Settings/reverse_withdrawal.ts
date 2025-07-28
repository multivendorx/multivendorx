import { __ } from '@wordpress/i18n';

export default {
    id: 'reverse-withdraw',
    priority: 27,
    name: __('Reverse Withdraw', 'mvx-pro'),
    desc: __('Reverse Withdraw', 'mvx-pro'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        // 1. Enable Reverse Withdrawal
        {
            key: 'enable_reverse_withdrawal',
            type: 'checkbox',
            label: __('Enable Reverse Withdrawal', 'multivendorx'),
            desc: __('Allow vendors to reverse/undo a withdrawal request before it is processed.', 'multivendorx'),
            options: [
                {
                    key: 'enable_reverse_withdrawal',
                    value: 'enable_reverse_withdrawal',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'section_reverse_withdrawal_gateway',
            type: 'section',
            desc: __( 'Enable Reverse Withdrawal for This Gateway', 'multivendorx' ),
            hint: __(
                'Toggle reverse withdrawal functionality independently for each payment gateway.',
                'multivendorx'
            ),
        },
        // 2. Cash On Delivery
        {
            key: 'enable_cod',
            type: 'checkbox',
            label: __('Cash On Delivery', 'multivendorx'),
            desc: __('Enable Cash on Delivery as a payment method for orders.', 'multivendorx'),
            options: [
                {
                    key: 'enable_cod',
                    value: 'enable_cod',
                },
            ],
            look: 'toggle',
        },

        
        // 3. Billing Type
        {
            key: 'billing_type',
            type: 'select',
            label: __('Billing Type', 'multivendorx'),
            desc: __('Choose how vendor billing is handled.', 'multivendorx'),
            options: [
                {
                    key: 'billing_prepaid',
                    label: __('Prepaid', 'multivendorx'),
                    value: 'prepaid',
                },
                {
                    key: 'billing_postpaid',
                    label: __('Postpaid', 'multivendorx'),
                    value: 'postpaid',
                },
                {
                    key: 'billing_credit',
                    label: __('On Credit', 'multivendorx'),
                    value: 'credit',
                },
            ],
        },

        // 4. Reverse Balance Threshold (USD)
        {
            key: 'reverse_balance_threshold',
            type: 'number',
            label: __('Reverse Balance Threshold (USD)', 'multivendorx'),
            desc: __('Minimum balance (in USD) required before a vendor can reverse a withdrawal.', 'multivendorx'),
        },

        // 5. Grace Period (days)
        {
            key: 'grace_period_days',
            type: 'number',
            label: __('Grace Period (days)', 'multivendorx'),
            desc: __('Number of days after withdrawal during which reversal is allowed.', 'multivendorx'),
        },
        {
            key: 'section_after_grace_period',
            type: 'section',
            desc: __( 'After Grace Period', 'multivendorx' ),
            hint: __(
                'Configure actions and notifications that occur once the withdrawal grace period has ended.',
                'multivendorx'
            ),
        },
        
        // 6. Disable Add to Cart Button
        {
            key: 'disable_add_to_cart',
            type: 'checkbox',
            label: __('Disable Add to Cart Button', 'multivendorx'),
            desc: __('Disable the “Add to Cart” button on vendor products when certain conditions apply.', 'multivendorx'),
            options: [
                {
                    key: 'disable_add_to_cart',
                    value: 'disable_add_to_cart',
                },
            ],
            look: 'toggle',
        },

        // 7. Hide Withdrawal
        {
            key: 'hide_withdrawal',
            type: 'checkbox',
            label: __('Hide Withdrawal', 'multivendorx'),
            desc: __('Completely hide the withdrawal interface from vendors.', 'multivendorx'),
            options: [
                {
                    key: 'hide_withdrawal',
                    value: 'hide_withdrawal',
                },
            ],
            look: 'toggle',
        },

        // 8. Make Seller Status Inactive
        {
            key: 'auto_inactivate_seller',
            type: 'checkbox',
            label: __('Make Seller Status Inactive', 'multivendorx'),
            desc: __('Automatically set sellers to “Inactive” when certain criteria are met.', 'multivendorx'),
            options: [
                {
                    key: 'auto_inactivate_seller',
                    value: 'auto_inactivate_seller',
                },
            ],
            look: 'toggle',
        },

        // 9. Display Notice During Grace Period
        {
            key: 'notice_during_grace_period',
            type: 'checkbox',
            label: __('Display Notice During Grace Period', 'multivendorx'),
            desc: __('Show a warning/message to vendors during the reversal grace period.', 'multivendorx'),
            options: [
                {
                    key: 'notice_during_grace_period',
                    value: 'notice_during_grace_period',
                },
            ],
            look: 'toggle',
        },

        // 10. Send Announcement
        {
            key: 'send_announcement',
            type: 'checkbox',
            label: __('Send Announcement', 'multivendorx'),
            desc: __('Enable sending a marketplace-wide announcement to all vendors via email/dashboard.', 'multivendorx'),
            options: [
                {
                    key: 'send_announcement',
                    value: 'send_announcement',
                },
            ],
            look: 'toggle',
        },
    ],
};
