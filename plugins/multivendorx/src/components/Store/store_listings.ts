import { __ } from '@wordpress/i18n';

export default {
    id: 'store-listings',
    priority: 4,
    name: __( ' Store Listings', 'multivendorx' ),
    desc: __(
        'Customize and manage the appearance and functionality of vendor shops within your marketplace.',
        'multivendorx'
    ),
    icon: 'adminlib-storefront',
    submitUrl: 'settings',
    modal: [
        {
            key: 'show_related_products',
            type: 'select',
            label: __( 'Related Product', 'multivendorx' ),
            desc: __(
                'Let customers view other products related to the product they are viewing..',
                'multivendorx'
            ),
            options: [
                {
                    key: 'all_related',
                    label: __(
                        'Related Products from Entire Store',
                        'multivendorx'
                    ),
                    value: __( 'all_related', 'multivendorx' ),
                },
                {
                    key: 'vendors_related',
                    label: __(
                        'Related Products from Seller Store',
                        'multivendorx'
                    ),
                    value: __( 'vendors_related', 'multivendorx' ),
                },
                {
                    key: 'disable',
                    label: __( 'Disable', 'multivendorx' ),
                    value: __( 'disable', 'multivendorx' ),
                },
            ],
        },
        {
            key: 'show_suborder_in_email',
            type: 'checkbox',
            label: __( 'Show Suborder in Email', 'multivendorx' ),
            desc: __( 'Enable this to include a detailed breakdown of suborders and products in customer and vendor emails.', 'multivendorx' ),
            options: [
                {
                    key: 'show_suborder_in_email',
                    value: 'show_suborder_in_email',
                },
            ],
            look: 'toggle',
        }        
    ],
};