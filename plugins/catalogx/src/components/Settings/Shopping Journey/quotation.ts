import { __ } from '@wordpress/i18n';
export default {
    id: 'quotation',
    priority: 3,
    name: __( 'Quotation', 'catalogx' ),
    desc: __(
        'Set up sales flow and catalog mode with integrated enquiry and quotation management.',
        'catalogx'
    ),
    icon: 'adminfont-cart',
    submitUrl: 'settings',
    modal: [
        {
            key: 'quote_user_permission',
            type: 'checkbox',
            label: __(
                'Limit quotation requests to logged-in users only',
                'catalogx'
            ),
            desc: __(
                'If enabled, non-logged-in users cannot submit quotation requests.',
                'catalogx'
            ),
            options: [
                {
                    key: 'logged_out',
                    value: 'logged_out',
                },
            ],
            look: 'toggle',
            moduleEnabled: 'quote',
            tour: 'quote-permission',
        },
        {
            key: 'set_expiry_time',
            type: 'text',
            label: __( 'Quotation expiry duration', 'catalogx' ),
            desc: __(
                'Set the period after which a quotation will expire and no longer be valid for purchase.',
                'catalogx'
            ),
            parameter: __( 'days', 'catalogx' ),
            proSetting: true,
            moduleEnabled: 'quote',
        },
    ],
};
