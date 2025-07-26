import { __ } from '@wordpress/i18n';

export default {
    id: 'store',
    priority: 1,
    name: __( 'Store', 'multivendorx' ),
    desc: __(
        'Customize and manage the appearance and functionality of vendor shops within your marketplace.',
        'multivendorx'
    ),
    icon: 'adminlib-storefront',
    submitUrl: 'settings',
    modal: [
        {
            key: 'mvx_vendor_shop_template',
            type: 'radio-select',
            label: __( 'Store header', 'multivendorx' ),
            desc: __(
                'Select a banner style for your vendors’ store headers. This allows you to choose how vendor stores will visually appear on the platform.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'template1',
                    label: __( 'Outer Space', 'multivendorx' ),
                    value: 'template1',
                    color: appLocalizer.template1,
                },
                {
                    key: 'template2',
                    label: __( 'Green Lagoon', 'multivendorx' ),
                    value: 'template2',
                    color: appLocalizer.template2,
                },
                {
                    key: 'template3',
                    label: __( 'Old West', 'multivendorx' ),
                    value: 'template3',
                    color: appLocalizer.template3,
                },
            ],
        },
        
    ],
};
