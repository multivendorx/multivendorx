import { __ } from '@wordpress/i18n';

export default {
    id: 'review-management',
    priority: 2,
    name: __( 'Reviews and Ratings', 'multivendorx' ),
    desc: __( 'Manage product and store review settings.', 'multivendorx' ),
    icon: 'adminlib-settings',
    submitUrl: 'settings',
    modal: [
        {
            key: 'store_rating_page',
            type: 'blocktext',
            label: __( 'no_label', 'multivendorx' ),
            blocktext: __(
                '<b>Admin must enable product reviews from WooCommerce settings</b>',
                'multivendorx'
            ),
        },
        {
            key: 'is_storereview',
            type: 'checkbox',
            label: __( 'Store reviews', 'multivendorx' ),
            desc: __( 'Allow customers to rate and review stores.', 'multivendorx' ),
            options: [
                {
                    key: 'is_storereview',
                    value: 'is_storereview',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'is_storereview_varified',
            type: 'checkbox',
            label: __( 'Verified buyer reviews only', 'multivendorx' ),
            desc: __( 'Accept reviews only from verified buyers who purchased a product.', 'multivendorx' ),
            options: [
                {
                    key: 'is_storereview_varified',
                    value: 'is_storereview_varified',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'product_review_sync',
            type: 'checkbox',
            label: __( 'Sync product ratings', 'multivendorx' ),
            desc: __( 'Store ratings will be calculated based on both store ratings and product ratings.', 'multivendorx' ),
            options: [
                {
                    key: 'product_review_sync',
                    value: 'product_review_sync',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'ratings_parameters',
            type: 'multi-string',
            label: __( 'Rating parameters', 'multivendorx' ),
            placeholder: __( 'Enter a parameter and click +', 'multivendorx' ),
            desc: __( 'Define rating parameters such as packaging, delivery, behaviour, policies, etc.', 'multivendorx' ),
            name: 'ratings_parameters',
            dependent: {
                key: 'product_review_sync',
                set: true,
            },
        }
    ],
};
