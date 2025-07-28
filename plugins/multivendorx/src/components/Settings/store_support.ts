import { __ } from '@wordpress/i18n';

export default {
    id: 'store-support',
    priority: 20,
    name: __( 'Store Support', 'mvx-pro' ),
    desc: __( 'Manage store support', 'mvx-pro' ),
    icon: 'adminlib-support',
    submitUrl: 'settings',
    modal: [
        {
            key: 'display_on_order_details',
            type: 'checkbox',
            label: __( 'Display on Order Details', 'multivendorx' ),
            desc: __( 'Enable this to show the support option on the order details page.', 'multivendorx' ),
            options: [
                {
                    key: 'display_on_order_details',
                    value: 'display_on_order_details',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'display_on_single_product',
            type: 'select',
            label: __( 'Display On Single Product Page', 'multivendorx' ),
            desc: __( 'Choose where and how this feature should appear on the single product page.', 'multivendorx' ),
            options: [
                {
                    key: 'display_nowhere',
                    label: __( 'Do Not Display', 'multivendorx' ),
                    value: 'display_nowhere',
                },
                {
                    key: 'display_above_cart',
                    label: __( 'Above Add to Cart', 'multivendorx' ),
                    value: 'display_above_cart',
                },
                {
                    key: 'display_below_cart',
                    label: __( 'Below Add to Cart', 'multivendorx' ),
                    value: 'display_below_cart',
                },
                {
                    key: 'display_in_sidebar',
                    label: __( 'In Sidebar', 'multivendorx' ),
                    value: 'display_in_sidebar',
                },
                {
                    key: 'display_custom_hook',
                    label: __( 'Custom Hook (Advanced)', 'multivendorx' ),
                    value: 'display_custom_hook',
                },
            ],
        },
        
        {
            key: 'support_button_label',
            type: 'text',
            label: __( 'Support Button Label', 'multivendorx' ),
            desc: __( 'Customize the label of the support button (e.g., “Get Help”, “Contact Support”).', 'multivendorx' ),
            placeholder: __( 'Enter button label', 'multivendorx' ),
        }
        
        
    ],
};
