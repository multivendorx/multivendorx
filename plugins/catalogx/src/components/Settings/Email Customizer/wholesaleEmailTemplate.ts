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
    submitUrl: 'settings',
    modal: [
        {
            key: 'notice',
            type: 'notice',
            title: __('Wholesale Email Templates Coming Soon', 'catalogx'),
            noticeType: 'info',
            display: 'inline-notice',
        },
    ],
};