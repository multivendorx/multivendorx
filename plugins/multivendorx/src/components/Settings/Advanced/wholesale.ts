import { __ } from '@wordpress/i18n';

export default {
    id: 'wholesale',
    priority: 2,
    name: __( 'Wholesale Visibility', 'mvx-pro' ),
    desc: __( 'Wholesale', 'mvx-pro' ),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        {
            key: 'wholesale_price_display',
            type: 'radio',
            label: __( 'Who can see wholesale price', 'mvx-pro' ),
            desc: __(
                'Who can actually see the wholesale price in product page',
                'mvx-pro'
            ),
            options: [
                {
                    key: 'all_user',
                    label: __(
                        'Display wholesale price to all users',
                        'mvx-pro'
                    ),
                    value: 'all_user',
                },
                {
                    key: 'wholesale_customer',
                    label: __(
                        'Display wholesale price to Wholesale customer only',
                        'mvx-pro'
                    ),
                    value: 'wholesale_customer',
                },
            ],
        },
        {
            key: 'display_price_in_shop_archive',
            label: __( 'Show wholesale price on shop archive', 'mvx-pro' ),
            type: 'checkbox',
            desc: __( 'Show wholesale price in the shop archive.', 'mvx-pro' ),
            options: [
                {
                    key: 'display_price_in_shop_archive',
                    value: 'display_price_in_shop_archive',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'need_approval_for_wholesale_customer',
            type: 'setting-toggle',
            label: __( 'Need approval for customer', 'mvx-pro' ),
            desc: __(
                'Customer need admin approval for becoming a wholesale customer.',
                'mvx-pro'
            ),
            options: [
                {
                    key: 'yes',
                    label: __( 'Yes', 'mvx-pro' ),
                    value: 'yes',
                },
                {
                    key: 'no',
                    label: __( 'No', 'mvx-pro' ),
                    value: 'no',
                },
            ],
        },
    ],
};
