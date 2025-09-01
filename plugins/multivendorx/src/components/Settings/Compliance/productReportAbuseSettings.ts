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
            type: 'setting-toggle',
            label: __( 'Who can report', 'multivendorx' ),
            settingDescription: __( 'Decide if only logged-in customers can submit abuse reports, or if reporting is open to everyone.', 'multivendorx' ),
			desc: __( '<ul><li>logged-in customers: Only registered and logged-in customers can report products.</li><li>Anyone logged in or guest: Anyone can report products, whether logged in or not.</li></ul>', 'multivendorx' ),
            options: [
                {
                    key: 'only_loggedin_can_report',
					label: __('logged-in customers', 'multivendorx'),
                    value: 'only_loggedin_can_report',
                },
				{
                    key: 'only_loggedin_can_report',
					label: __('Anyone logged in or guest)', 'multivendorx'),
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
                'Define one or more preset reasons that stores can choose from when submitting an abuse report.<br><b>Note</b>: Users can report products for various issues. When enabling logged-in user restriction, anonymous reports will be blocked. Abuse reports are reviewed by administrators who can take appropriate action including product removal or store penalties.',
                'multivendorx'
            ),
            name: 'abuse_report_reasons',
        }
    ],
};
