import { __ } from '@wordpress/i18n';

export default {
    id: 'policy',
    priority: 1,
    name: __( 'Add Policies', 'mvx-pro' ),
    desc: __( 'Define and publish the rules and guidelines that apply to your marketplace.', 'mvx-pro' ),
    icon: 'adminlib-support',
    submitUrl: 'settings',
    modal: [
        {
            key: 'store-policy',
            type: 'textarea',
            desc: __(
                'The marketplace will display policies created by the admin. However, stores can edit and override their own store policies.',
                'multivendorx'
            ),
            label: __( 'Store policy', 'multivendorx' ),
        },
        {
            key: 'shipping_policy',
            type: 'textarea',
            desc: __(
                'The marketplace will display policies created by the admin. However, stores can edit and override their own shipping policies.',
                'multivendorx'
            ),
            label: __( 'Shipping policy', 'multivendorx' ),
        },
        {
            key: 'refund_policy',
            type: 'textarea',
            desc: __(
                'The marketplace will display policies created by the admin. However, stores can edit and override their own refund policies.',
                'multivendorx'
            ),
            label: __( 'Refund policy', 'multivendorx' ),
        },
        {
            key: 'cancellation_policy',
            type: 'textarea',
            desc: __(
                'The marketplace will display policies created by the admin. However, stores can edit and override their own cancellation, return, or exchange policies.',
                'multivendorx'
            ),
            label: __( 'Cancellation / return / exchange policy', 'multivendorx' ),
        },
    ],
};
