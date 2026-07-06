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
            label: __('Block email domains', 'notifima'),
            settingDescription: __(
                'Specify email domains that are not allowed to subscribe for stock notifications.',
                'notifima'
            ),
            desc: __(
                'Enter one or more email domains separated by commas. Customers using these domains will be prevented from subscribing.',
                'notifima'
            ),
            proSetting: true,
        },
        {
            key: 'ban_email_domain_text',
            type: 'textarea',
            label: __('Blocked domain alert message', 'notifima'),
            settingDescription: __(
                'Customize the message displayed when a customer uses a blocked email domain.',
                'notifima'
            ),
            desc: __(
                'This message is shown when a subscription request is rejected because the email domain is blocked.',
                'notifima'
            ),
            proSetting: true,
        },
        {
            key: 'ban_email_addresses',
            type: 'textarea',
            label: __('Blocked email addresses', 'notifima'),
            settingDescription: __(
                'Specify individual email addresses that are not allowed to subscribe for stock notifications.',
                'notifima'
            ),
            desc: __(
                'Enter one or more email addresses separated by commas. Subscription requests from these email addresses will be rejected.',
                'notifima'
            ),
            proSetting: true,
        },
        {
            key: 'ban_email_address_text',
            type: 'textarea',
            label: __('Blocked email alert message', 'notifima'),
            settingDescription: __(
                'Customize the message displayed when a blocked email address attempts to subscribe.',
                'notifima'
            ),
            desc: __(
                'This message is shown when a subscription request is rejected because the email address is blocked.',
                'notifima'
            ),
            proSetting: true,
        },

        //mailchimp
        {
            key: 'is_mailchimp_enable',
            type: 'choice-toggle',
            label: __('Marketing integration', 'notifima'),
            settingDescription: __(
                'Choose whether to store subscribers locally or automatically sync them with your Mailchimp audience.',
                'notifima'
            ),
            desc: __(
                '<ul><li>Store only - Save subscriber information only within your website.</li><li>Mailchimp - Automatically add new subscribers to your Mailchimp audience. Enter your Mailchimp API key below to connect your account.</li></ul>',
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
            proSetting: true,
        },
        {
            key: 'mailchimp_api',
            type: 'text',
            size: 25,
            label: __('Mailchimp API key', 'notifima'),
            settingDescription: __(
                'Enter your Mailchimp API key to connect your Mailchimp account.',
                'notifima'
            ),
            desc: __(
                'Generate an API key from your Mailchimp account and paste it here to enable audience synchronization.',
                'notifima'
            ),
            dependent: {
                key: 'is_mailchimp_enable',
                set: true,
                value: 'mailchimp'
            },
            proSetting: true,
        },
        {
            key: 'mailchimp',
            type: 'sequential-task-executor',
            variant: true,
            apilink: 'mailchimps',
            buttonText: 'Start',
            buttonIcon: 'centralized-connections',
            label: __('Mailchimp connection', 'notifima'),
            settingDescription: __(
                'Connect your Mailchimp account and select the audience for new subscribers.',
                'notifima'
            ),
            desc: __(
                'Start the connection process after entering a valid Mailchimp API key.',
                'notifima'
            ),
            dependent: {
                key: 'is_mailchimp_enable',
                set: true,
                value: 'mailchimp'
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
