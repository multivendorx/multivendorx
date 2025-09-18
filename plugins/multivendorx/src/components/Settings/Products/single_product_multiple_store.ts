import { __ } from '@wordpress/i18n';

export default {
    id: 'single-product-multiple-store',
    priority: 2,
    name: __( 'Single Product Multiple Vendors (SPMV)', 'multivendorx' ),
    desc: __(
        'Manage how multiple vendors (stores) can list and sell the same product in your marketplace.',
        'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [
        
        {
            key: 'singleproductmultistore_show_order',
            type: 'setting-toggle',
            label: __( 'SPMV Product listing priority', 'multivendorx' ),
            desc: __(
                'Choose which version of SPMV product will be shown as the main listing on the shop page (e.g., top-rated store, min / max priced product).',
                'multivendorx'
            ),
            options: [
                {
                    key: 'min-price',
                    label: __( 'Lowest price', 'multivendorx' ),
                    value: __( 'min-price', 'multivendorx' ),
                },
                {
                    key: 'max-price',
                    label: __( 'Highest price', 'multivendorx' ),
                    value: __( 'max-price', 'multivendorx' ),
                },
                {
                    key: 'top-rated-store',
                    label: __( 'Top rated store', 'multivendorx' ),
                    value: __( 'top-rated-store', 'multivendorx' ),
                },
                {
                    key: 'top-rated-store',
                    label: __( 'Based on nearby location', 'multivendorx' ),
                    value: __( 'based-on-nearby-location', 'multivendorx' ),
                },
            ],
        },
        {
            key: 'moreoffers_display_position',
            type: 'setting-toggle',
            label: __( 'More offers display position', 'multivendorx' ),
            desc: __(
                'Decide where additional SPMV offers should be displayed on the single product page to make them visible to customers.',
                'multivendorx'
            ),
            postText:__(' single page product tabs.', 'multivendorx'),
            options: [
                {
                    key: 'none',
                    label: __( 'None', 'multivendorx' ),
                    value: 'none',
                },
                {
                    key: 'above-tabs',
                    label: __( 'Above', 'multivendorx' ),
                    value: 'above-tabs',
                },
                {
                    key: 'inside-tabs',
                    label: __( 'Inside', 'multivendorx' ),
                    value: 'inside-tabs',
                },
                {
                    key: 'after-tabs',
                    label: __( 'After', 'multivendorx' ),
                    value: 'after-tabs',
                },
            ],
        },
    ],
};
