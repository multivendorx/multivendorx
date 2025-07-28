import { __ } from '@wordpress/i18n';

export default {
    id: 'store-policies',
    priority: 5,
    name: __( 'Store Policies', 'multivendorx' ),
    desc: __(
        'Let each store define its own buyer policies',
        'multivendorx'
    ),
    icon: 'adminlib-storefront',
    submitUrl: 'settings',
    modal: [
        {
            key: 'enable_per_store_refund_policy',
            type: 'checkbox',
            label: __( 'Refund Policy', 'multivendorx' ),
            desc: __( 'Allow vendors to override the global refund policy with their own per-store policy.', 'multivendorx' ),
            options: [
                {
                    key: 'enable_per_store_refund_policy',
                    value: 'enable_per_store_refund_policy',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'cancellation_policy',
            type: 'textarea',
            desc: __(
                'Site will reflect admin created policy. However vendors can edit and override store policies.',
                'multivendorx'
            ),
            label: __(
                'Cancellation / Return / Exchange Policy',
                'multivendorx'
            ),
            moduleEnabled: 'store-policy',
        },                  
    ]    
};