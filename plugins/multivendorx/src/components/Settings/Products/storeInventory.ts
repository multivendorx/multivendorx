import { __ } from '@wordpress/i18n';

export default {
    id: 'store-inventory',
    priority: 4,
    name: __('Store inventory', 'multivendorx'),
    desc: __(
        'Manage inventory alerts and stock monitoring settings for stores in your marketplace.',
        'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [
        {
            key: 'low_stock_notifications', // changed key
            type: 'nested',
            label: __('Low stock alerts', 'multivendorx'),
            single: true,
            nestedFields: [
                {
                    key: 'low_stock_alert',
                    type: 'checkbox',
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
                    preText: __('Notify stores when inventory falls below', 'multivendorx'),
                    postText: __('units.', 'multivendorx'),
                    size: '8rem',
                    dependent: {
                        key: 'low_stock_alert',      // field it depends on
                        value: 'low_stock_alert',    // value that must be selected
                        set: true,                   // show when this value is selected
                    },
                },
            ],
        },
        {
            key: 'out_of_stock_notifications', // main key for this nested setting
            type: 'nested',
            label: __('Out of stock alerts', 'multivendorx'),
            single: true,
            nestedFields: [
                {
                    key: 'out_of_stock_alert',
                    type: 'checkbox',
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
                    preText: __('Notify stores when inventory reaches below', 'multivendorx'),
                    postText: __('units.', 'multivendorx'),
                    size: '8rem',
                    dependent: {
                        key: 'out_of_stock_alert',   // depends on checkbox
                        value: 'out_of_stock_alert', // show when selected
                        set: true,
                    },
                },
            ],
        },
        






        // {
        //     key: 'low_stock_alert',
        //     type: 'checkbox',
        //     label: __('Low stock alerts', 'multivendorx'),
        //     desc: __(
        //         'Automatically notify stores when product inventory drops below a specified level',
        //         'multivendorx'
        //     ),
        //     options: [
        //         {
        //             key: 'low_stock_alert',
        //             value: 'low_stock_alert',
        //         },
        //     ],
        //     look: 'toggle',
        //     // //proSetting:true
        // },
        // {
        //     key: 'low_stock_alert_threshold',
        //     type: 'number',
        //     label: __('Low stock alert threshold', 'multivendorx'),
        //     desc: __(
        //         'Set the minimum inventory count that triggers low stock notifications',
        //         'multivendorx'
        //     ),
        //     dependent: {
        //         key: 'low_stock_alert',
        //         value: 'low_stock_alert',
        //     },
        //     // //proSetting:true
        // },
        // {
        //     key: 'out_of_stock_alert',
        //     type: 'checkbox',
        //     label: __('Out of stock alerts', 'multivendorx'),
        //     desc: __(
        //         'Automatically notify stores when products become completely unavailable',
        //         'multivendorx'
        //     ),
        //     options: [
        //         {
        //             key: 'out_of_stock_alert',
        //             value: 'out_of_stock_alert',
        //         },
        //     ],
        //     look: 'toggle',
        //     // //proSetting:true
        // },
        // {
        //     key: 'out_of_stock_alert_threshold',
        //     type: 'number',
        //     label: __('Out of stock alert threshold', 'multivendorx'),
        //     desc: __(
        //         'Set the inventory level (typically 0) that triggers out of stock notifications.',
        //         'multivendorx'
        //     ),
        //     dependent: {
        //         key: 'out_of_stock_alert',
        //         value: 'out_of_stock_alert',
        //     },
        //     // //proSetting:true
        // },
    ],
};
