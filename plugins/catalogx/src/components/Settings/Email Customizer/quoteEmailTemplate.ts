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
    submitUrl: 'settings',
    modal: [
        {
            key: 'notice',
            type: 'notice',
            title: __('Quote Email Templates Coming Soon', 'catalogx'),
            noticeType: 'info',
            display: 'inline-notice',
        },
    ],
};