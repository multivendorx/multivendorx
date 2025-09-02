import { __ } from '@wordpress/i18n';

export default {
    id: 'advertising',
    priority: 1,
    name: __( 'Product Advertising', 'mvx-pro' ),
    desc: __(
        'Let stores promote their top products or unique offerings in site-wide placements.',
        'mvx-pro'
    ),
    icon: 'adminlib-clock2',
    submitUrl: 'settings',
    modal: [
        {
            key: 'total_available_slot',
            type: 'number',
            label: __( 'Available advertising slots', 'mvx-pro' ),
            desc: __(
                'Set the number of advertising slots available to stores. This limits how many products they can promote at the same time.',
                'mvx-pro'
            ),
            moduleEnabled: 'advertisement',
            proSetting: true,
        },
        {
            key: 'expire_after_days',
            type: 'number',
            label: __( 'Advertising duration (days)', 'mvx-pro' ),
            desc: __(
                'Set how long a product will stay advertised. Stores can choose the duration up to this limit.',
                'mvx-pro'
            ),
            moduleEnabled: 'advertisement',
            proSetting: true,
        },
        {
            key: 'store_can_purchase_advertisement',
            label: __( 'Allow stores to purchase advertising', 'multivendorx' ),
            type: 'checkbox',
            desc: __(
                'Enable to let stores purchase advertising from the product listing or edit page.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'store_can_purchase_advertisement',
                    value: 'store_can_purchase_advertisement',
                },
            ],
            look: 'toggle',
            //proSetting:true
        },        
        {
            key: 'cost',
            type: 'number',
            label: sprintf(
                '%1$s (%2$s)',
                __( 'Advertising cost', 'mvx-pro' ),
                appLocalizer.woocommerce_currency
            ),
            desc: __(
                'Set the price for each advertising slot. Enter "0" to allow stores to advertise for free.',
                'mvx-pro'
            ),
            dependent: {
                key: 'store_can_purchase_advertisement',
                set: true,
            },
            //proSetting:true
        },
        {
            key: 'store_advertisement_advanced_settings',
            type: 'checkbox',
            label: __( 'Advanced advertising settings', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'enable_advertisement_in_subscription',
                    label: __( 'Include advertising in subscriptions', 'multivendorx' ),
                    value: 'enable_advertisement_in_subscription',
                    desc: __( 'Allow stores to advertise products at no extra cost if included in their subscription plan.', 'multivendorx' ),
                    proSetting:true
                },
                {
                    key: 'mark_advertised_product_as_featured',
                    label: __( 'Mark advertised products as featured', 'multivendorx' ),
                    value: 'mark_advertised_product_as_featured',
                    desc: __( 'Automatically mark advertised products as featured. They will be removed from the featured list once advertising expires.', 'multivendorx' ),
                    proSetting:true
                },
                {
                    key: 'display_advertised_product_on_top',
                    label: __( 'Show advertised products at the top', 'multivendorx' ),
                    value: 'display_advertised_product_on_top',
                    desc: __( 'Display advertised products at the top of catalog pages such as the shop or store page.', 'multivendorx' ),
                    proSetting:true
                },
                {
                    key: 'out_of_stock_visibility',
                    label: __( 'Hide out-of-stock advertised products', 'multivendorx' ),
                    value: 'out_of_stock_visibility',
                    desc: __( 'Hide advertised products that are out of stock. Note: if WooCommerce’s out-of-stock visibility setting is enabled, products will be hidden regardless of this setting.', 'multivendorx' ),
                    proSetting:true
                },
            ],
            selectDeselect: true,
            //proSetting:true

        },
        
    ],
};
