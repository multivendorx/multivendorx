import { __ } from '@wordpress/i18n';

export default {
    id: 'privacy-settings',
    priority: 6,
    name: __( 'Privacy', 'multivendorx' ),
    desc: __(
        'Control public visibility of store and store info',
        'multivendorx'
    ),
    icon: 'adminlib-storefront',
    submitUrl: 'settings',
    modal: [ 
        {
            key: 'store_page_details',
            type: 'checkbox',
            label: __( 'Store info on products', 'multivendorx' ),
            desc: __( 'Control what store information (name, logo, address) is displayed on product listings and detail pages.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'show_store_name_on_products',
                    label: __( 'Store name', 'multivendorx' ),
                    desc: __( 'Display store name on product listings and detail pages', 'multivendorx' ),
                    value: 'show_store_owner_info',
                },
                {
                    key: 'show_store_logo_next_to_products',
                    label: __( 'Store logo', 'multivendorx' ),
                    desc: __( 'Include store branding alongside product information', 'multivendorx' ),
                    value: 'show_store_description',
                },
                {
                    key: 'show_order_breakdown_by_store',
                    label: __( 'Order breakdown by store', 'multivendorx' ),
                    desc: __( 'Display which items come from which store and their corresponding sub order number in email confirmations', 'multivendorx' ),
                    value: 'show_store_address',
                },                
            ],
            selectDeselect: true,
        },
        {
            key: 'store_page_details',
            type: 'checkbox',
            label: __( 'Store-wise order display', 'multivendorx' ),
            desc: __( 'Control whether customers see orders grouped by vendor in cart, checkout, and confirmation emails.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'group_items_by_store_in_cart',
                    label: __( 'Group items by store in cart', 'multivendorx' ),
                    desc: __( 'Organize cart contents by individual stores for clarity', 'multivendorx' ),
                    value: 'show_store_owner_info',
                },
                ],
            selectDeselect: true,
        },
        {
            key: 'store_page_details',
            type: 'checkbox',
            label: __( 'Vendor contact display', 'multivendorx' ),
            desc: __( 'Control whether vendor contact and support details are visible to customers during checkout and in emails.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'show_store_owner_info',
                    label: __( 'Address', 'multivendorx' ),
                    value: 'show_store_owner_info',
                },
                {
                    key: 'show_store_description',
                    label: __( 'Phone number', 'multivendorx' ),
                    value: 'show_store_description',
                },
                {
                    key: 'show_store_description',
                    label: __( 'Email address', 'multivendorx' ),
                    value: 'show_store_description',
                },
                {
                    key: 'show_store_description',
                    label: __( 'Store description', 'multivendorx' ),
                    value: 'show_store_description',
                },
                {
                    key: 'show_store_ratings',
                    label: __( 'Store ratings', 'multivendorx' ),
                    value: 'show_store_ratings',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'store_policy_override',
            type: 'checkbox',
            label: __( 'Vendor policy override', 'multivendorx' ),
            desc: __( 'Allow vendors to set their own store policies instead of using the default admin policies.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'enable_per_store_refund_policy',
                    label: __( 'Store', 'multivendorx' ),
                    value: 'enable_per_store_refund_policy',
                },
                {
                    key: 'enable_per_store_refund_policy',
                    label: __( 'Shipping', 'multivendorx' ),
                    value: 'enable_per_store_refund_policy',
                },
                {
                    key: 'enable_per_store_refund_policy',
                    label: __( 'Refund and return', 'multivendorx' ),
                    value: 'enable_per_store_refund_policy',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'separator_store_policy_override',
            type: 'section',
            desc: __( 'Allow store owners to temporarily disable their profile, hiding it and its products from the marketplace.', 'multivendorx' ),
            hint: __(
                'Store profile controls',
                'multivendorx'
            ),
        },
        {
            key: 'enable_profile_deactivation_request',
            type: 'checkbox',
            label: __( 'Profile deactivation requests', 'multivendorx' ),
            options: [
                {
                    key: 'enable_profile_deactivation_request',
                    value: 'enable_profile_deactivation_request',
                },
            ],
            look: 'toggle',
        },  
    ],
};
