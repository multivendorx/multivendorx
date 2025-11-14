import { __ } from '@wordpress/i18n';


export default {
    id: 'notification-configuration',
    priority: 5,
    name: __('Notification Configuration', 'multivendorx'),
    desc: __('Define what each store role can access and manage within the marketplace. All notifications dispatched by the site can be tracked and reviewed from this page', 'multivendorx'),
    icon: 'adminlib-user-network-icon',
    submitUrl: 'settings',
    modal: [
        {
            key: 'registration page',
            type: 'blocktext',
            label: __('no_label', 'multivendorx'),
            blocktext: __(
                'Only store owners can apply for store registration. Applicants must log in or create an account before proceeding. So, Make sure WooCommerce’s Account & Privacy settings are configured to allow user registration.',
                'multivendorx'
            ),
            // blockTextClass: "nor"
        },
        {
            key: 'email_section',
            type: 'section',
            hint: __('Email provider', 'multivendorx'),
        },
        {
            key: 'email_provider',
            type: 'setting-toggle',
            label: __('Email provider', 'multivendorx'),
            settingDescription: __('Choose which service will send your marketplace emails.', 'multivendorx'),
            options: [
                {
                    key: 'wp_mail',
                    label: __('WordPress Default (wp_mail)', 'multivendorx'),
                    value: 'wp_mail',
                },
                {
                    key: 'sendgrid',
                    label: __('SendGrid', 'multivendorx'),
                    value: 'sendgrid',
                },
                {
                    key: 'mailgun',
                    label: __('Mailgun', 'multivendorx'),
                    value: 'mailgun',
                },
                {
                    key: 'amazon_ses',
                    label: __('Amazon SES', 'multivendorx'),
                    value: 'amazon_ses',
                },
            ],
        },

        {
            key: 'sender_name',
            type: 'text',
            label: __('Sender name', 'multivendorx'),
            placeholder: __('Marketplace Team', 'multivendorx'),
            settingDescription: __('The name that will appear in the "From" field of outgoing emails.', 'multivendorx'),
        },

        {
            key: 'sender_email_address',
            type: 'email',
            label: __('Sender email address', 'multivendorx'),
            placeholder: __('noreply@yourstore.com', 'multivendorx'),
            settingDescription: __('The email address from which marketplace notifications will be sent.', 'multivendorx'),
            desc: __('The email address from which notifications are sent is provided. Test emails can be sent to confirm delivery.', 'multivendorx'),

        },

        {
            key: 'sms_section',
            type: 'section',
            hint: __('SMS Configuration', 'multivendorx'),
        },
        {
            key: 'sms_gateway_selector',
            type: 'setting-toggle',
            label: __('Select SMS Gateway', 'multivendorx'),
            settingDescription: __('Pick the SMS service your marketplace will use to send text alerts.', 'multivendorx'),
            options: [
                {
                    key: 'none',
                    label: __('None', 'multivendorx'),
                    value: '',
                },
                {
                    key: 'twilio',
                    label: __('Twilio', 'multivendorx'),
                    value: 'twilio',
                },
                {
                    key: 'vonage',
                    label: __('Vonage (Nexmo)', 'multivendorx'),
                    value: 'vonage',
                },
                {
                    key: 'clickatell',
                    label: __('Clickatell', 'multivendorx'),
                    value: 'clickatell',
                },
                {
                    key: 'plivo',
                    label: __('Plivo', 'multivendorx'),
                    value: 'plivo',
                },
                {
                    key: 'fake_gateway',
                    label: __('Fake Gateway (Testing)', 'multivendorx'),
                    value: 'fake',
                },
            ],
        },

    ]
}