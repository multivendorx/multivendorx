import { __ } from '@wordpress/i18n';

export default {
    id: 'form-submission',
    priority: 2,
    headerTitle: __('Subscription status messages', 'notifima'),
    headerDescription: __('Control how the subscription form and customer messages appear throughout your store.', 'notifima'),
    headerIcon: 'person',
    submitUrl: 'settings',
    modal: [
        {
            key: 'alert_success',
            type: 'textarea',
            label: __('Successful form submission', 'notifima'),
            settingDescription: __(
                'Customize the message displayed after a customer successfully subscribes to stock notifications.',
                'notifima'
            ),
            desc: __(
                'Use <code>%product_title%</code> to display the product name and <code>%customer_email%</code> to display the subscriber\'s email address.',
                'notifima'
            ),
        },
        {
            key: 'alert_email_exist',
            type: 'textarea',
            label: __('Repeated subscription alert', 'notifima'),
            settingDescription: __(
                'Customize the message displayed when a customer attempts to subscribe to a product they have already subscribed to.',
                'notifima'
            ),
            desc: __(
                'Use <code>%product_title%</code> to display the product name and <code>%customer_email%</code> to display the subscriber\'s email address.',
                'notifima'
            ),
        },
        {
            key: 'valid_email',
            type: 'textarea',
            label: __('Email validation error', 'notifima'),
            settingDescription: __(
                'Customize the message displayed when a customer enters an invalid email address.',
                'notifima'
            ),
            desc: __(
                'This message is shown when the entered email address is missing or does not have a valid format.',
                'notifima'
            ),
        },
        {
            key: 'alert_unsubscribe_message',
            type: 'textarea',
            label: __('Unsubscribe confirmation', 'notifima'),
            settingDescription: __(
                'Customize the confirmation message displayed after a customer successfully unsubscribes.',
                'notifima'
            ),
            desc: __(
                'This message is shown once the unsubscribe request has been completed successfully.',
                'notifima'
            ),
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
