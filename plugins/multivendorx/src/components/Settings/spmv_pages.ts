import { __ } from '@wordpress/i18n';

export default {
    id: 'spmv-pages',
    priority: 7,
    name: __( 'SPMV(Single Product Multiple Vendor)', 'multivendorx' ),
    desc: __(
        "Give sellers the option to add other seller's products into their store inventory.",
        'multivendorx'
    ),
    icon: 'adminlib-form-section',
    submitUrl: 'settings',
    modal: [
        {
            key: 'is_singleproductmultiseller',
            type: 'checkbox',
            label: __( 'Allow Vendor to Copy Products', 'multivendorx' ),
            desc: __(
                'Let vendors search for products sold on your site and sell them from their store.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'is_singleproductmultiseller',
                    value: 'is_singleproductmultiseller',
                },
            ],
            proSetting: true,
            look: 'toggle',
            moduleEnabled: 'spmv',
        },
    ],
};
