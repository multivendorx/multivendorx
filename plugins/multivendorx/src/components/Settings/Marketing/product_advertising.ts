import { __ } from '@wordpress/i18n';

export default {
    id: 'advertising',
    priority: 1,
    name: __('Product Advertising', 'mvx-pro'),
    desc: __(
        'Let stores promote their top products or unique offerings in site-wide placements.',
        'mvx-pro'
    ),
    icon: 'adminlib-clock',
    submitUrl: 'settings',
    modal: [
        {
            key: 'store_promotion_limit',
            label: __('Store promotion limit', 'multivendorx'),
            settingDescription: __('Define how many products a store can promote for free and the cost for additional paid promotions.', 'multivendorx'),
            type: 'nested',
            single: true,
            nestedFields: [
                {
                    key: 'paid_promotion_limit',
                    type: 'number',
                    size:'8rem',
                    preText: __('Each store can promote up to', 'multivendorx'),
                    postText: __('products for free,and additionally promote up to', 'multivendorx'),
                },
                {
                    key: 'promotion_slot_cost',
                    type: 'number',
                    size:'8rem',
                    // preText: __(' and additionally promote up to', 'multivendorx'),
                    postText: __('paid products at a cost of', 'multivendorx'),
                },
                {
                    key: 'promotion_slot_cost_',
                    type: 'number',
                    size:'8rem',
                    postText: __('per slot.', 'multivendorx'),
                }
            ],
        },
        // {
        //     key: 'cost',
        //     type: 'number',
        //     label: __('Advertising cost', 'multivendorx'),
        //     preInsideText: __('$', 'multivendorx'),
        //     postText:__('stores must pay to use per advertising slot. Use 0 if you want advertising to be free.', 'multivendorx'),
        //     size: '8rem',
        //     placeholder: 0,
        //     //proSetting:true
        // },

        {
            key: 'expire_after_days',
            type: 'number',
            label: __('Max promotion duration', 'mvx-pro'),
            desc: __(
                'Set how long a product will stay advertised. Stores can choose the duration up to this limit.',
                'mvx-pro'
            ),
            postInsideText: __('days', 'multivendorx'),
            size: '8rem',
            moduleEnabled: 'advertisement',
            proSetting: true,
        },
        {
            key: 'store_advertisement_advanced_settings',
            type: 'checkbox',
            label: __('Advanced advertising settings', 'multivendorx'),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'enable_advertisement_in_subscription',
                    label: __('Include advertising in subscriptions', 'multivendorx'),
                    value: 'enable_advertisement_in_subscription',
                    desc: __('Allow stores to advertise products at no extra cost if included in their subscription plan.', 'multivendorx'),
                    proSetting: true
                },
                {
                    key: 'mark_advertised_product_as_featured',
                    label: __('Mark advertised products as featured', 'multivendorx'),
                    value: 'mark_advertised_product_as_featured',
                    desc: __('Automatically mark advertised products as featured. They will be removed from the featured list once advertising expires.', 'multivendorx'),
                    proSetting: true
                },
                {
                    key: 'display_advertised_product_on_top',
                    label: __('Show advertised products at the top', 'multivendorx'),
                    value: 'display_advertised_product_on_top',
                    desc: __('Display advertised products at the top of catalog pages such as the shop or store page.', 'multivendorx'),
                    proSetting: true
                },
                {
                    key: 'out_of_stock_visibility',
                    label: __('Hide out-of-stock advertised products', 'multivendorx'),
                    value: 'out_of_stock_visibility',
                    desc: __('Hide advertised products that are out of stock. Note: if WooCommerce’s out-of-stock visibility setting is enabled, products will be hidden regardless of this setting.', 'multivendorx'),
                    proSetting: true
                },
            ],
            selectDeselect: true,
            //proSetting:true

        },

    ],
};
