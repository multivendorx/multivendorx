import { __ } from '@wordpress/i18n';

export default {
    id: 'policy',
    priority: 3,
    name: __( 'Policies', 'mvx-pro' ),
    desc: __( 'Define and publish the rules and guidelines that apply to your marketplace.', 'mvx-pro' ),
    icon: 'adminlib-support',
    submitUrl: 'settings',
    modal: [
        {
            key: 'store_policy',
            type: 'textarea',
            desc: __(
                'Policies created by the admin are displayed by default. Stores can edit and override their own policies.',
                'multivendorx'
            ),
            label: __( 'Store policy', 'multivendorx' ),
            moduleEnabled: 'store-policy',
        },
        {
            key: 'shipping_policy',
            type: 'textarea',
            desc: __(
                'Admin-created shipping policies are displayed by default. Stores can modify them as needed.',
                'multivendorx'
            ),
            label: __( 'Shipping policy', 'multivendorx' ),
            moduleEnabled: 'store-policy',
        },
        {
            key: 'refund_policy',
            type: 'textarea',
            desc: __(
                'Admin creates refund policies. Stores can adjust them for their store.',
                'multivendorx'
            ),
            label: __( 'Refund policy', 'multivendorx' ),
            moduleEnabled: 'store-policy',
        },
        {
            key: 'cancellation_policy',
            type: 'textarea',
            desc: __(
                'Default cancellation, return, or exchange policies set by the admin are displayed. Stores can override them.',
                'multivendorx'
            ),
            label: __( 'Cancellation / return / exchange policy', 'multivendorx' ),
            moduleEnabled: 'store-policy',
        },
    ],
};
