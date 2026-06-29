import { __ } from '@wordpress/i18n';

export default {
    id: 'email',
    priority: 3,
    headerTitle: __('Notifications & Integrations', 'notifima'),
    headerDescription: __('Control subscriber notifications, manage blocked email lists, and connect Notifima with your favorite marketing platforms.', 'notifima'),
    headerIcon: 'mail',
    proDependent: true,
    submitUrl: 'settings',
    modal: [
        {
            key: 'ban_email_domains',
            type: 'textarea',
            desc: __(
                'Prevent subscriptions from specific email domains. Enter multiple domains separated by commas.',
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
                'Message displayed when a customer attempts to subscribe using a blocked email domain.',
                'notifima'
            ),
            proSetting: true,
        },
        {
            key: 'ban_email_addresses',
            type: 'textarea',
            desc: __(
                'Prevent specific email addresses from subscribing. Enter multiple email addresses separated by commas.',
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
                'Message displayed when a blocked email address attempts to subscribe.',
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
                "Automatically add new subscribers to your Mailchimp audience and streamline your email marketing.<br>Get your MailChimp API from your MailChimp <a href='https://us20.admin.mailchimp.com/account/api/manage/#create' target='blank'>account</a>. For further help, please check this doc.",
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
