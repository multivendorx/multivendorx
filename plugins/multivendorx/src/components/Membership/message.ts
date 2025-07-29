import { __ } from '@wordpress/i18n';

export default {
    id: 'message',
    priority: 1,
    name: __( 'Message/Mails', 'mvx-pro' ),
    desc: __( 'Message/Mails', 'mvx-pro' ),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        {
            key: 'webhook_redirect_uri',
            type: 'blocktext',
            label: __( 'Config webhook URI', 'mvx-pro' ),
            blocktext: __(
                'To enable recurring subscriptions, you need to configure webhooks. Please navigate to the webhook settings and set your webhook URL.',
                'mvx-pro'
            ),
        }
    ],
};
