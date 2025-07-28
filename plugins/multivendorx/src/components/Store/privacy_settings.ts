import { __ } from '@wordpress/i18n';

export default {
    id: 'privacy-settings',
    priority: 9,
    name: __( 'Privacy Settings', 'multivendorx' ),
    desc: __(
        'Control public visibility of store and seller info',
        'multivendorx'
    ),
    icon: 'adminlib-storefront',
    submitUrl: 'settings',
    modal: [
        {
            key: 'hide_sold_by_label',
            type: 'checkbox',
            label: __( 'Hide “Sold By” Label', 'multivendorx' ),
            desc: __( 'Enable this to hide the "Sold By" label on product pages.', 'multivendorx' ),
            options: [
                {
                    key: 'hide_sold_by_label',
                    value: 'hide_sold_by_label',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'display_vendor_name_on_products',
            type: 'checkbox',
            label: __( 'Display Vendor Name on Products', 'multivendorx' ),
            desc: __( 'Enable this to show the vendor’s name on product listings.', 'multivendorx' ),
            options: [
                {
                    key: 'display_vendor_name_on_products',
                    value: 'display_vendor_name_on_products',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'sold_by_location',
            type: 'checkbox',
            label: __( 'Sold By Location', 'multivendorx' ),
            desc: __( 'Enable this to show vendor location next to the "Sold By" label.', 'multivendorx' ),
            options: [
                {
                    key: 'sold_by_location',
                    value: 'sold_by_location',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'show_store_owner_info',
            type: 'checkbox',
            label: __( 'Show Store Owner Info on Store Page', 'multivendorx' ),
            desc: __( 'Display the store owner’s profile info on the store page.', 'multivendorx' ),
            options: [
                {
                    key: 'show_store_owner_info',
                    value: 'show_store_owner_info',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'show_store_description',
            type: 'checkbox',
            label: __( 'Show Store Description', 'multivendorx' ),
            desc: __( 'Enable this to display the store’s description on their store page.', 'multivendorx' ),
            options: [
                {
                    key: 'show_store_description',
                    value: 'show_store_description',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'show_store_address',
            type: 'checkbox',
            label: __( 'Show Store Address', 'multivendorx' ),
            desc: __( 'Enable this to show the physical store address on the store page.', 'multivendorx' ),
            options: [
                {
                    key: 'show_store_address',
                    value: 'show_store_address',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'show_contact_button',
            type: 'checkbox',
            label: __( 'Show Contact Button', 'multivendorx' ),
            desc: __( 'Display a contact button for visitors to reach out to the vendor.', 'multivendorx' ),
            options: [
                {
                    key: 'show_contact_button',
                    value: 'show_contact_button',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'show_store_ratings',
            type: 'checkbox',
            label: __( 'Show Store Ratings', 'multivendorx' ),
            desc: __( 'Enable this to show the average store rating on the store page.', 'multivendorx' ),
            options: [
                {
                    key: 'show_store_ratings',
                    value: 'show_store_ratings',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'buyer_see_store_details_in_email',
            type: 'checkbox',
            label: __( 'Buyer Can See Store Details in Email', 'multivendorx' ),
            desc: __( 'Show vendor/store details in order confirmation and related emails sent to the buyer.', 'multivendorx' ),
            options: [
                {
                    key: 'buyer_see_store_details_in_email',
                    value: 'buyer_see_store_details_in_email',
                },
            ],
            look: 'toggle',
        }
    ]    
};