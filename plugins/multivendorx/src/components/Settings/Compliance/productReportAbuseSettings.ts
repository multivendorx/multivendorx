import { __ } from '@wordpress/i18n';

export default {
    id: 'product-report-abuse',
    priority: 2,
    name: __('Product Report Abuse', 'mvx-pro'),
    desc: __('Set rules and options for product abuse reporting.', 'mvx-pro'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        {
            key: 'only_loggedin_can_report',
            type: 'checkbox',
            label: __( 'Reported by', 'multivendorx' ),
            desc: __( 'Allow only logged-in users to submit abuse reports. Enable this to restrict reports to verified users.', 'multivendorx' ),
            options: [
                {
                    key: 'only_loggedin_can_report',
                    value: 'only_loggedin_can_report',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'abuse_report_reasons',
            type: 'multi-string',
            label: __( 'Reasons for abuse report', 'multivendorx' ),
            placeholder: __( 'Enter a reason and click +', 'multivendorx' ),
            desc: __(
                'Define one or more preset reasons that stores can choose from when submitting an abuse report.',
                'multivendorx'
            ),
            name: 'abuse_report_reasons',
        }
    ],
};
