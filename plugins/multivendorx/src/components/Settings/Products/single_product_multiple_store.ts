import { __ } from '@wordpress/i18n';

export default {
    id: 'single-product-multiple-store',
    priority: 2,
    name: __( 'Single Product Multiple Vendors', 'multivendorx' ),
    desc: __(
        'Manage how multiple vendors (stores) can list and sell the same product in your marketplace.',
        'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [
        {
            key: 'is_singleproductmultistore',
            type: 'checkbox',
            label: __( 'Allow store to copy products', 'multivendorx' ),
            desc: __(
                'Enable this to let vendors (stores) search for existing products in your marketplace and add them to their own store catalog.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'is_singleproductmultistore',
                    value: 'is_singleproductmultistore',
                },
            ],
            look: 'toggle',
            // moduleEnabled: 'spmv',
        },
        {
            key: 'singleproductmultistore_show_order',
            type: 'select',
            label: __( 'Display shop page product', 'multivendorx' ),
            desc: __(
                'Choose which version of SPMV product will be shown as the main listing on the shop page (e.g., top-rated store, min / max priced product).',
                'multivendorx'
            ),
            options: [
                {
                    key: 'min-price',
                    label: __( 'Min price', 'multivendorx' ),
                    value: __( 'min-price', 'multivendorx' ),
                },
                {
                    key: 'max-price',
                    label: __( 'Max Price', 'multivendorx' ),
                    value: __( 'max-price', 'multivendorx' ),
                },
                {
                    key: 'top-rated-store',
                    label: __( 'Top rated store', 'multivendorx' ),
                    value: __( 'top-rated-store', 'multivendorx' ),
                },
            ],
            dependent: {
                key: 'is_singleproductmultistore',
                set: true,
            },
            moduleEnabled: 'spmv',
        },
        {
            key: 'moreoffers_display_position',
            type: 'select',
            label: __( 'More offers display position', 'multivendorx' ),
            desc: __(
                'Select where the “More Offers” section will appear on the single product page, showing buyers other vendors selling the same item.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'none',
                    label: __( 'None', 'multivendorx' ),
                    value: 'none',
                },
                {
                    key: 'above-tabs',
                    label: __( 'Above single page product tabs', 'multivendorx' ),
                    value: 'above-tabs',
                },
                {
                    key: 'inside-tabs',
                    label: __( 'Display inside single page product tabs', 'multivendorx' ),
                    value: 'inside-tabs',
                },
                {
                    key: 'after-tabs',
                    label: __( 'After single page product tabs', 'multivendorx' ),
                    value: 'after-tabs',
                },
            ],
            dependent: {
                key: 'is_singleproductmultistore',
                set: true,
            },
            proSetting: false,
            moduleEnabled: 'spmv',
        },
    ],
};
