import { __ } from '@wordpress/i18n';

export default {
    id: 'privacy-settings',
    priority: 6,
    name: __( 'Privacy', 'multivendorx' ),
    desc: __('Manage what customers can see about your stores.','multivendorx'),
    icon: 'adminlib-storefront',
    submitUrl: 'settings',
    modal: [ 
        {
            key: 'store_page_details',
            type: 'checkbox',
            label: __( 'Store branding', 'multivendorx' ),
            settingDescription: __( 'Decide which details appear with products and on store pages.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'show_store_name_on_products',
                    label: __( 'Name', 'multivendorx' ),
                    desc: __( 'Include the store name on product listings, archive, checkout, and cart pages.', 'multivendorx' ),
                    value: 'show_store_owner_info',
                },
                {
                    key: 'show_store_logo_next_to_products',
                    label: __( 'Logo', 'multivendorx' ),
                    desc: __( 'Place the store logo alongside product details.', 'multivendorx' ),
                    value: 'show_store_description',
                },
				
				{
                    key: 'show_store_description',
                    label: __( 'Store description', 'multivendorx' ),
					desc: __( 'Present a short store bio on product and store pages.', 'multivendorx' ),
                    value: 'show_store_description',
                },
                {
                    key: 'show_store_ratings',
                    label: __( 'Store ratings', 'multivendorx' ),
					desc: __( 'Highlight customer feedback on store and product pages.', 'multivendorx' ),
                    value: 'show_store_ratings',
                },
                                
            ],
            selectDeselect: true,
        },
		{
            key: 'store_page_details',
            type: 'checkbox',
            label: __( 'Store contact informations', 'multivendorx' ),
            settingDescription: __( 'Choose the contact details visible to customers.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'show_store_owner_info',
                    label: __( 'Business address', 'multivendorx' ),
					desc: __('Make the store’s physical location available.','multivendorx'),
                    value: 'show_store_owner_info',
                },
                {
                    key: 'show_store_description',
                    label: __( 'Phone number', 'multivendorx' ),
					desc: __('Provide a direct contact number.','multivendorx'),
                    value: 'show_store_description',
                },
                {
                    key: 'show_store_description',
                    label: __( 'Email address', 'multivendorx' ),
					desc: __('Offer an email for customer queries.','multivendorx'),
                    value: 'show_store_description',
                },
                
            ],
            selectDeselect: true,
        },
        {
            key: 'store_page_details',
            type: 'checkbox',
            label: __( 'Store-wise order display', 'multivendorx' ),
            settingDescription: __( 'Control whether customers see orders grouped by vendor in cart, checkout, and confirmation emails.', 'multivendorx' ),
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
            key: 'store_policy_override',
            type: 'checkbox',
            label: __( 'Store policy override', 'multivendorx' ),
            settingDescription: __( 'Give stores the option to create their own policies instead of using marketplace defaults.', 'multivendorx' ),
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
            desc: __( 'Store owners can temporarily disable their profile, hiding it and its products from the marketplace.', 'multivendorx' ),
            hint: __(
                'Store profile controls',
                'multivendorx'
            ),
        },
        {
            key: 'enable_profile_deactivation_request',
            type: 'checkbox',
            label: __( 'Store profile deactivation requests', 'multivendorx' ),
			desc: __( 'Store owners will submit requests for temporary store hiding. <br><b>Note</b>: When a store is deactivated, both the store page and all its products become invisible to customers until the store is reactivated by an administrator. If a store is permanently deleted by admin, the admin can decide whether to allocate all the products to another store or take ownership of them.', 'multivendorx' ),
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
