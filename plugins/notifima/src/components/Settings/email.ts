import { __ } from '@wordpress/i18n';

export default {
    id: 'email',
    priority: 3,
    headerTitle: __('Notifications & Integrations', 'notifima'),
    headerDescription: __('Manage subscriber notifications and connect marketing tools.', 'notifima'),
    headerIcon: 'mail',
    proDependent: true,
    submitUrl: 'settings',
    modal: [
        {
            key: 'ban_email_domains',
            type: 'textarea',
            desc: __(
                'Specify email domains that are restricted from subscribing. You can add multiple commma seperated emails.',
                'notifima'
            ),
            label: __('Block email domains', 'notifima'),
            proSetting: true,
        },
        {
            key: 'ban_email_domain_text',
            type: 'textarea',
            label: __('Blocked domain alert message', 'notifima'),
            desc: __(
                'Create an alert message for users attempting to subscribe from blocked domains.',
                'notifima'
            ),
            proSetting: true,
        },
        {
            key: 'ban_email_addresses',
            type: 'textarea',
            desc: __(
                'Specify email addresses that are restricted from subscribing. You can add multiple commma seperated emails.',
                'notifima'
            ),
            label: __('Blocked email addresses', 'notifima'),
            proSetting: true,
        },
        {
            key: 'ban_email_address_text',
            type: 'textarea',
            label: __('Blocked email alert message', 'notifima'),
            desc: __(
                'Create an alert message for users attempting to subscribe from blocked Email ID.',
                'notifima'
            ),
            proSetting: true,
        },

        //mailchimp
        {
            key: 'is_mailchimp_enable',
            type: 'choice-toggle',
            label: __('Enable Mailchimp', 'notifima'),
            desc: __(
                "Get your MailChimp API from your MailChimp <a href='https://us20.admin.mailchimp.com/account/api/manage/#create' target='blank'>account</a>. For further help, please check this doc.",
                'notifima'
            ),
            options: [
                {
                    key: 'store_only',
                    label: __('Store only', 'notifima'),
                    value: 'store_only',
                },
                {
                    key: 'mailchimp',
                    label: __('Mailchimp', 'notifima'),
                    value: 'mailchimp',
                },
            ],
            proSetting:true,
        },
        {
            key: 'mailchimp_api',
            type: 'text',
            size: 25,
            label: __('Mailchimp API', 'notifima'),
            dependent: {
                key: 'is_mailchimp_enable',
                set: true,
                value:'mailchimp'
            },
            proSetting: true,
        },
        {
            key: 'mailchimp',
            type: 'sequential-task-executor',
            variant:"api-connect",
            apilink: 'mailchimps',
            buttonText: 'Start',
            buttonIcon: 'centralized-connections',
            label: __('Mailchimp connection', 'notifima'),
            dependent: {
                key: 'is_mailchimp_enable',
                set: true,
                value:'mailchimp'
            },
            proSetting: true,
        },
        {
            key: 'note_blocktext',
            type: 'notice',
            noticeType: 'info',
            displayPosition: 'notice',
            message:
                'Disclaimer – Loco Translator Compatibility: This plugin allows you to customize certain frontend text settings and descriptions. Default texts are Loco Translator-ready, but any changes made in the corresponding custom text box will no longer be available for translation via Loco Translator. Hence, please enter the customized text in your desired language only.',
        },
    ],
};
