import { __ } from '@wordpress/i18n';

export default {
    id: 'notifications',
    priority: 3,
    headerTitle: __('Notifications', 'notifima'),
    headerDescription: __('Control subscriber notifications, manage blocked email lists, and connect Notifima with your favorite marketing platforms.', 'notifima'),
    headerIcon: 'mail',
    groupBySections: true,
    hideSettingHeader: true,
    proDependent: true,
    submitUrl: 'settings',
    modal: [
        {
            key: 'section',
            type: 'section',
            icon: 'mail',
            title: __('Notifications', 'notifima'),
            desc: __('Control subscriber notifications, manage blocked email lists, and connect Notifima with your favorite marketing platforms.', 'notifima')
        },
        {
            key: 'ban_email_domains',
            type: 'textarea',
            label: __('Block email domains', 'notifima'),
            settingDescription: __(
                'Specify email domains that are not allowed to subscribe for stock notifications. Enter multiple domains separated by commas.',
                'notifima'
            ),
            proSetting: true,
        },
        {
            key: 'ban_email_domain_text',
            type: 'textarea',
            label: __('Blocked domain alert message', 'notifima'),
            settingDescription: __(
                'Customize the message shown when a subscription is rejected due to a blocked email domain.',
                'notifima'
            ),
            proSetting: true,
        },
        {
            key: 'ban_email_addresses',
            type: 'textarea',
            label: __('Blocked email addresses', 'notifima'),
            settingDescription: __(
                'Specify email addresses that are not allowed to subscribe for stock notifications. Enter multiple addresses separated by commas.',
                'notifima'
            ),
            proSetting: true,
        },
        {
            key: 'ban_email_address_text',
            type: 'textarea',
            label: __('Blocked email alert message', 'notifima'),
            settingDescription: __(
                'Customize the message shown when a subscription is rejected due to a blocked email address.',
                'notifima'
            ),
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
        //new 
        {
            key: 'section',
            type: 'section',
            icon: 'mail',
            title: __('Admin Notifications', 'notifima'),
            desc: __('Choose who on your team is alerted about new restock subscriptions.', 'notifima'),
        },
        {
            key: 'additional_alert_email',
            type: 'textarea',
            label: __('Recipient email for new subscriber', 'notifima'),
            settingDescription: __(
                'Choose who receives email notifications when customers subscribe for restock alerts. Separate multiple email addresses with commas.',
                'notifima'
            ),
        },
    ],
};
