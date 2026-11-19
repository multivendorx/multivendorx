import { __ } from '@wordpress/i18n';

export default {
    id: 'wholesale-email-template',
    priority: 3,
    headerTitle: __('Wholesale', 'catalogx'),
    headerDescription: __(
        'Customize the email template used for wholesale notifications.',
        'catalogx'
    ),
    headerIcon: 'wholesale',
    groupBySections: true,
    hideSettingHeader: true,
    submitUrl: 'settings',
    modal: [
        {
            key: 'wholesale_email_section',
            type: 'section',
            icon: 'wholesale',
            title: __('Wholesale email', 'catalogx'),
            desc: __(
                'The emails sent when a wholesale buyer registers or is approved.',
                'catalogx'
            ),
        },
        {
            key: 'notice',
            type: 'notice',
            title: __('Wholesale email templates are coming soon.', 'catalogx'),
            noticeType: 'info',
            display: 'inline-notice',
        },
    ],
};