import { __ } from '@wordpress/i18n';

export default {
    id: 'email',
    priority: 4,
    name: __('Email Restriction Policies', 'notifima'),
    desc: __('Restrict email registrations.', 'notifima'),
    icon: 'adminfont-mail',
    proDependent: true,
    submitUrl: 'settings',
    modal: [
        {
            key: 'ban_email_domains',
            type: 'textarea',
            class: 'textarea-input',
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
            class: 'textarea-input',
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
            class: 'textarea-input',
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
            class: 'textarea-input',
            label: __('Blocked email alert message', 'notifima'),
            desc: __(
                'Create an alert message for users attempting to subscribe from blocked Email ID.',
                'notifima'
            ),
            proSetting: true,
        },
        {
            key: 'note_blocktext',
            type: 'blocktext',
            label: ' ',
            blocktext:
                'Disclaimer – Loco Translator Compatibility: This plugin allows you to customize certain frontend text settings and descriptions. Default texts are Loco Translator-ready, but any changes made in the corresponding custom text box will no longer be available for translation via Loco Translator. Hence, please enter the customized text in your desired language only.',
        },
    ],
};
