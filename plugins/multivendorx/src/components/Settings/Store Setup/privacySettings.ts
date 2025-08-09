import { __ } from '@wordpress/i18n';

export default {
    id: 'privacy-settings',
    priority: 8,
    name: __( 'Privacy Settings', 'multivendorx' ),
    desc: __(
        'Control public visibility of store and seller info',
        'multivendorx'
    ),
    icon: 'adminlib-storefront',
    submitUrl: 'settings',
    modal: [
        {
            key: 'enable_profile_deactivation_request',
            type: 'checkbox',
            label: __( 'Profile Deactivation Request', 'multivendorx' ),
            desc: __( 'Allow vendors to request temporary deactivation of their store from their dashboard.', 'multivendorx' ),
            options: [
                {
                    key: 'enable_profile_deactivation_request',
                    value: 'enable_profile_deactivation_request',
                },
            ],
            look: 'toggle',
        },   
        {
            key: 'product_page_visibility',
            type: 'checkbox',
            label: __( 'Product Page Settings', 'multivendorx' ),
            desc: __( 'Control the display of store information on product pages.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'hide_sold_by_label',
                    label: __( 'Hide “Sold By” Label', 'multivendorx' ),
                    value: 'hide_sold_by_label',
                },
                {
                    key: 'display_vendor_name_on_products',
                    label: __( 'Display Vendor Name on Products', 'multivendorx' ),
                    value: 'display_vendor_name_on_products',
                },
                {
                    key: 'sold_by_location',
                    label: __( 'Sold By Location', 'multivendorx' ),
                    value: 'sold_by_location',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'separator_store_page_details',
            type: 'section',
            desc: __( 'Store Page Details', 'multivendorx' ),
            hint: __(
                'Control which vendor information is visible on the vendor’s store page.',
                'multivendorx'
            ),
        },
        {
            key: 'store_page_details',
            type: 'checkbox',
            label: __( 'Store Page Settings', 'multivendorx' ),
            desc: __( 'Manage vendor information visibility on the store page.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'show_store_owner_info',
                    label: __( 'Show Store Owner Info on Store Page', 'multivendorx' ),
                    value: 'show_store_owner_info',
                },
                {
                    key: 'show_store_description',
                    label: __( 'Show Store Description', 'multivendorx' ),
                    value: 'show_store_description',
                },
                {
                    key: 'show_store_address',
                    label: __( 'Show Store Address', 'multivendorx' ),
                    value: 'show_store_address',
                },
                {
                    key: 'show_contact_button',
                    label: __( 'Show Contact Button', 'multivendorx' ),
                    value: 'show_contact_button',
                },
                {
                    key: 'show_store_ratings',
                    label: __( 'Show Store Ratings', 'multivendorx' ),
                    value: 'show_store_ratings',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'separator_email_visibility',
            type: 'section',
            desc: __( 'Email Visibility', 'multivendorx' ),
            hint: __(
                'Control what vendor/store information is visible in customer emails.',
                'multivendorx'
            ),
        },
        {
            key: 'email_visibility_settings',
            type: 'checkbox',
            label: __( 'Email Visibility Settings', 'multivendorx' ),
            desc: __( 'Manage store details shown in customer emails.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'buyer_see_store_details_in_email',
                    label: __( 'Buyer Can See Store Details in Email', 'multivendorx' ),
                    value: 'buyer_see_store_details_in_email',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'separator_store_policy_override',
            type: 'section',
            desc: __( 'Store Policy Override', 'multivendorx' ),
            hint: __(
                'Allow vendors to set or override the default store policies (e.g., refund, shipping, and cancellation policies).',
                'multivendorx'
            ),
        },
        {
            key: 'store_policy_override',
            type: 'checkbox',
            label: __( 'Store Policy Settings', 'multivendorx' ),
            desc: __( 'Allow vendors to override default marketplace policies.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'enable_per_store_refund_policy',
                    label: __( 'Refund Policy', 'multivendorx' ),
                    value: 'enable_per_store_refund_policy',
                },
            ],
            selectDeselect: true,
        },
    ],
};
