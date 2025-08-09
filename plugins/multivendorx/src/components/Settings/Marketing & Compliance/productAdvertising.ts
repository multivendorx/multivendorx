import { __ } from '@wordpress/i18n';

export default {
    id: 'advertising',
    priority: 1,
    name: __( 'Product Advertising', 'mvx-pro' ),
    desc: __(
        'Control how stores can advertise their products within your marketplace.',
        'mvx-pro'
    ),
    icon: 'adminlib-clock2',
    submitUrl: 'settings',
    modal: [
        {
            key: 'total_available_slot',
            type: 'number',
            label: __( 'Available advertisement slots', 'mvx-pro' ),
            desc: __(
                'Define the number of advertising slots available to stores. This determines how many products they can promote at any given time.',
                'mvx-pro'
            ),
            moduleEnabled: 'advertisement',
            proSetting: true,
        },
        {
            key: 'expire_after_days',
            type: 'number',
            label: __( 'Expire After Days', 'mvx-pro' ),
            desc: __(
                'Set the duration (in days) that a product will be advertised. Stores can choose how long their products stay in the spotlight.',
                'mvx-pro'
            ),
            moduleEnabled: 'advertisement',
            proSetting: true,
        },
        {
            key: 'store_can_purchase_advertisement',
            label: __( 'Store Can Purchase Advertisement', 'multivendorx' ),
            type: 'checkbox',
            desc: __(
                'If you check this checkbox, stores will be able to purchase advertisement from product listing and product edit page.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'store_can_purchase_advertisement',
                    value: 'store_can_purchase_advertisement',
                },
            ],
            look: 'toggle',
        },        
        {
            key: 'cost',
            type: 'number',
            label: sprintf(
                '%1$s (%2$s)',
                __( 'Advertisement Cost', 'mvx-pro' ),
                appLocalizer.woocommerce_currency
            ),
            desc: __(
                'Specify the cost for each advertisement slot. Enter "0" if you want to allow vendors to advertise for free.',
                'mvx-pro'
            ),
            dependent: {
                key: 'store_can_purchase_advertisement',
                set: true,
            },
        },
        {
            key: 'store_advertisement_advanced_settings',
            type: 'checkbox',
            label: __( 'Store Advertisement Advanced Settings', 'multivendorx' ),
            desc: __( 'Control advanced advertisement options for stores.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'enable_advertisement_in_subscription',
                    label: __( 'Enable Advertisement In Subscription', 'multivendorx' ),
                    value: 'enable_advertisement_in_subscription',
                    desc: __( 'If you check this checkbox, stores will be able to advertise their products without any additional cost based on the plan they are subscribed to.', 'multivendorx' ),
                },
                {
                    key: 'mark_advertised_product_as_featured',
                    label: __( 'Mark Advertised Product as Featured?', 'multivendorx' ),
                    value: 'mark_advertised_product_as_featured',
                    desc: __( 'If you check this checkbox, advertised product will be marked as featured. Products will be automatically removed from featured list after advertisement is expired.', 'multivendorx' ),
                },
                {
                    key: 'display_advertised_product_on_top',
                    label: __( 'Display Advertised Product on Top?', 'multivendorx' ),
                    value: 'display_advertised_product_on_top',
                    desc: __( 'If you check this checkbox, advertised products will be displayed on top of the catalog listing e.g., shop page, single store page, etc.', 'multivendorx' ),
                },
                {
                    key: 'out_of_stock_visibility',
                    label: __( 'Out of Stock Visibility', 'multivendorx' ),
                    value: 'out_of_stock_visibility',
                    desc: __( 'Hide out of stock items from the advertisement list. Note that, if WooCommerce setting for out of stock visibility is checked, product will be hidden despite this setting.', 'multivendorx' ),
                },
            ],
            selectDeselect: true,
        },
        
    ],
};
