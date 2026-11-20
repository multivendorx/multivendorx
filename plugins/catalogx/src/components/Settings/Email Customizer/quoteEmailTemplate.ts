import { __ } from '@wordpress/i18n';

export default {
    id: 'quote-email-template',
    priority: 2,
    headerTitle: __('Quote', 'catalogx'),
    headerDescription: __(
        'Customize the email template used for quote notifications.',
        'catalogx'
    ),
    headerIcon: 'quote',
    groupBySections: true,
    hideSettingHeader: true,
    submitUrl: 'settings',
    modal: [
        {
            key: 'quote_email_section',
            type: 'section',
            icon: 'quote',
            title: __('Quote email', 'catalogx'),
            desc: __(
                'The email sent for each new quote request.',
                'catalogx'
            ),
        },
        {
            key: 'notice',
            type: 'notice',
            title: __('Quote email templates are coming soon.', 'catalogx'),
            noticeType: 'info',
            display: 'inline-notice',
        },
    ],
};