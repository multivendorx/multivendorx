import { __ } from '@wordpress/i18n';

export default {
    id: 'product-report-abuse',
    priority: 25,
    name: __('Product Report Abuse Settings', 'mvx-pro'),
    desc: __('Product Report Abuse Settings', 'mvx-pro'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        {
            key: 'only_loggedin_can_report',
            type: 'checkbox',
            label: __( 'Reported by', 'multivendorx' ),
            desc: __( 'Only logged-in users can report abuse. Enable this to restrict reports to authenticated users.', 'multivendorx' ),
            options: [
                {
                    key: 'only_loggedin_can_report',
                    value: 'only_loggedin_can_report',
                },
            ],
            look: 'toggle',
            proSetting: true,
        },
        {
            key: 'abuse_report_reasons',
            type: 'multi-string',
            label: __( 'Reason for Abuse Report', 'multivendorx' ),
            placeholder: __( 'Enter a reason and click +', 'multivendorx' ),
            desc: __(
                'Add one or more predefined reasons that vendors can select when reporting abuse.',
                'multivendorx'
            ),
            name: 'abuse_report_reasons',
        }
    ],
};
