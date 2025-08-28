import { __ } from '@wordpress/i18n';

export default {
    id: 'store-inventory',
    priority: 4,
    name: __('Store inventory', 'multivendorx'),
    desc: __(
        'Manage inventory alerts and stock monitoring settings for vendors in your marketplace',
        'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [
        {
            key: 'low_stock_alert',
            type: 'checkbox',
            label: __('Low stock alerts', 'multivendorx'),
            desc: __(
                'Notify vendors when inventory is running low.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'low_stock_alert',
                    value: 'low_stock_alert',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'low_stock_alert_threshold',
            type: 'number',
            label: __('Low stock alert threshold', 'multivendorx'),
            desc: __(
                'Set the inventory level that triggers low stock alerts for vendors',
                'multivendorx'
            ),
            dependent: {
                key: 'low_stock_alert',
                value: 'low_stock_alert',
            },

        },
        {
            key: 'out_of_stock_alert',
            type: 'checkbox',
            label: __('Out of stock alerts', 'multivendorx'),
            desc: __(
                'Notify vendors when products are unavailable.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'out_of_stock_alert',
                    value: 'out_of_stock_alert',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'out_of_stock_alert_threshold',
            type: 'number',
            label: __('Out of stock alert threshold', 'multivendorx'),
            desc: __(
                'Set the inventory level that triggers out of stock alerts for vendors',
                'multivendorx'
            ),
            dependent: {
                key: 'out_of_stock_alert',
                value: 'out_of_stock_alert',
            },
        },
    ],
};
