import { __ } from '@wordpress/i18n';

export default {
    id: 'mailchimp',
    priority: 5,
    name: __('Mailchimp Integration', 'notifima'),
    desc: __('Integrate Mailchimp for email marketing.', 'notifima'),
    icon: 'adminfont-mailchimp',
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
        {
            // Spacial input field
            key: 'mailchimp_api',
            selectKey: 'selected_mailchimp_list',
            optionKey: 'mailchimp_list_options',
            apiLink: 'mailchimps',
            type: 'api-connect',
            label: __('Mailchimp API', 'notifima'),
            dependent: {
                key: 'is_mailchimp_enable',
                set: true,
            },
            proSetting: true,
        },
    ],
};
