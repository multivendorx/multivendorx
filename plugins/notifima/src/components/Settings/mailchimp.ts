import { __ } from '@wordpress/i18n';

export default {
    id: 'mailchimp',
    priority: 4,
    headerTitle: __('Mailchimp Integration', 'notifima'),
    headerDescription: __('Integrate Mailchimp for email marketing.', 'notifima'),
    headerIcon: 'mailchimp',
    proDependent: true,
    submitUrl: 'settings',
    modal: [
        {
            key: 'is_mailchimp_enable',
            type: 'checkbox',
            label: __('Enable Mailchimp', 'notifima'),
            desc: __(
                "Get your MailChimp API from your MailChimp <a href='https://us20.admin.mailchimp.com/account/api/manage/#create' target='blank'>account</a>. For further help, please check this doc.",
                'notifima'
            ),
            options: [
                {
                    key: 'is_mailchimp_enable',
                    value: 'is_mailchimp_enable',
                },
            ],
            proSetting: true,
            look: 'toggle',
        },
        //new
        {
            key: 'mailchimp_api',
            type: 'text',
            size: 25,
            label: __('Mailchimp API', 'notifima'),
            dependent: {
                key: 'is_mailchimp_enable',
                set: true,
            },
            proSetting: true,
        },
        {
            key: 'test_connection',
            type: 'sequential-task-executor',
            apilink: 'mailchimps',
            buttonText: 'Start',
            buttonIcon: 'centralized-connections',
            interval: 2500,
            label: __('Mailchimp connection', 'notifima'),
            dependent: {
                key: 'is_mailchimp_enable',
                set: true,
            },
            proSetting: true,
        },
    ],
};
