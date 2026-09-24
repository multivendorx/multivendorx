import { __ } from '@wordpress/i18n';
export default {
    id: 'automation',
    priority: 1,
    headerTitle: __('Automation', 'notifima'),
    headerDescription: __('Set the automation rules that control customer subscriptions, restock notifications, and lead time behavior.', 'notifima'),
    headerIcon: 'automation',
    groupBySections: true,
    hideSettingHeader: true,
    submitUrl: 'settings',
    modal: [
        {
            key: 'section',
            type: 'section',
            icon: 'automation',
            title: __('Automation', 'notifima'),
            desc: __('Control who can subscribe to restock alerts and when the subscription form is displayed.', 'notifima'),
        },
        {
            key: 'is_guest_subscriptions_enable',
            type: 'choice-toggle',
            label: __('Subscription access', 'notifima'),
            settingDescription: __(
                'Choose who is allowed to sign up for restock alerts.',
                'notifima'
            ),
            options: [
                {
                    key: 'everyone',
                    label: __('Everyone', 'notifima'),
                    value: 'everyone',
                },
                {
                    key: 'logged_in',
                    label: __('Logged-in customers only', 'notifima'),
                    value: 'logged_in',
                },
            ],
        },
        {
            key: 'is_enable_backorders',
            type: 'checkbox',
            label: __('Show subscription form for', 'notifima'),
            settingDescription: __(
                'Choose when the "notify me" form appears on a product page.',
                'notifima'
            ),
            options: [
                {
                    key: 'outofstock',
                    value: 'outofstock',
                    label: __('Out of stock', 'notifima'),
                },
                {
                    key: 'onbackorder',
                    value: 'onbackorder',
                    label: __('On backorder', 'notifima'),
                }
            ],
            selectDeselect: true,
        },
        {
            key: 'section',
            type: 'section',
            icon: 'clock',
            title: __('Restock Timing (Lead Time)', 'notifima'),
            desc: __(
                'Control when and how the expected restock time is shown to shoppers.',
                'notifima'
            ),
        },
        {
            key: 'display_lead_times',
            type: 'checkbox',
            label: __('Stock Status for Lead Time', 'notifima'),
            settingDescription: __(
                'Choose which products show an expected restock time.',
                'notifima'
            ),
            options: [
                {
                    key: 'outofstock',
                    value: 'outofstock',
                    label: __('Out of stock', 'notifima'),
                },
                {
                    key: 'onbackorder',
                    value: 'onbackorder',
                    label: __('On backorder', 'notifima'),
                }
            ],
            selectDeselect: true,
        },
        {
            key: 'lead_time_format',
            type: 'choice-toggle',
            label: __('Lead Format', 'notifima'),
            settingDescription: __(
                'Choose how the restock time message appears on product pages.',
                'notifima'
            ),
            dependent: {
                key: 'display_lead_times',
                set: true,
            },
            // defaultValue: 'static',
            options: [
                {
                    key: 'static',
                    label: __('Static', 'notifima'),
                    value: 'static',
                },
                {
                    key: 'dynamic',
                    label: __('Dynamic', 'notifima'),
                    value: 'dynamic',
                    proSetting: true,
                },
            ],
        },
        {
            key: 'lead_time_static_text',
            type: 'text',
            label: __('Lead time default message', 'notifima'),
            settingDescription: __(
                'The message shoppers see when a product has no restock time of its own.',
                'notifima'
            ),
            size: 20,
            dependent: [
                {
                    key: 'lead_time_format',
                    value: 'static',
                },
                {
                    key: 'display_lead_times',
                    set: true,
                },
            ],
        },
        {
            key: 'section',
            type: 'section',
            icon: 'subscriber',
            title: __('Subscription Experience', 'notifima'),
            desc: __(
                'Customize how customers sign up for and manage restock alerts.',
                'notifima'
            ),
        },
        {
            key: 'display_subscription_form_as',
            type: 'choice-toggle',
            label: __('Display subscription form as', 'notifima'),
            settingDescription: __(
                'Choose how the sign-up form is shown to customers.',
                'notifima'
            ),
            options: [
                {
                    key: 'popup',
                    value: 'popup',
                    label: __('Popup', 'notifima'),
                },
                {
                    key: 'inline',
                    value: 'inline',
                    label: __('Inline In-page', 'notifima'),
                },
            ],
        },
        {
            key: 'is_enable_no_interest',
            type: 'choice-toggle',
            label: __(
                'Subscriber visibility',
                'notifima'
            ),
            settingDescription: __(
                'Choose whether customers can see how many people have subscribed to a product.',
                'notifima'
            ),

            options: [
                {
                    key: 'hide_count',
                    label: __('Hide subscriber count', 'notifima'),
                    value: 'hide_count',
                },
                {
                    key: 'show_count',
                    label: __('Show subscriber count', 'notifima'),
                    value: 'show_count',
                },
            ],
        },
        {
            key: 'shown_interest_text',
            type: 'textarea',
            label: __('Subscriber count notification message', 'notifima'),
            settingDescription: __(
                'Customize the message shown with the subscriber count on product pages. Use <code>%no_of_subscribed%</code> to display the current subscriber count.',
                'notifima'
            ),
            dependent: {
                key: 'is_enable_no_interest',
                set: true,
                value: 'show_count',
            },
        },
        {
            key: 'is_double_optin',
            type: 'choice-toggle',

            label: __('Subscription confirmation', 'notifima'),
            settingDescription: __(
                'Choose how customer sign-ups are confirmed.',
                'notifima'
            ),
            options: [
                {
                    key: 'subscribe_immediately',
                    label: __('Subscribe immediately', 'notifima'),
                    value: 'subscribe_immediately',
                },
                {
                    key: 'confirm_via_email',
                    label: __('Confirm via email', 'notifima'),
                    value: 'confirm_via_email',
                },
            ],
            proSetting: true,
        },

        {
            key: 'double_opt_in_success',
            type: 'textarea',
            label: __('Subscription confirmation message', 'notifima'),
            settingDescription: __(
                'Customize the message shown after a customer submits a subscription request.',
                'notifima'
            ),
            dependent: {
                key: 'is_double_optin',
                set: true,
                value: 'confirm_via_email',
            },
            proSetting: true,
        },
        {
            key: 'unsubscribe_button_text',
            type: 'text',
            label: __("'Unsubscribe' Button Caption", 'notifima'),
            settingDescription: __(
                'The text on the button subscribed customers click to stop alerts. If left blank, "Unsubscribe" is used.',
                'notifima'
            ),
            size: 20,
            placeholder: __('Unsubscribe', 'notifima'),
        },


        // mailchimp
        {
            key: 'section',
            type: 'section',
            icon: 'global-community',
            title: __('Audience Synchronization', 'notifima'),
            desc: __(`Choose where subscriber details are saved and whether they're sent to your marketing tools.`, 'notifima'),
        },
        {
            key: 'is_mailchimp_enable',
            type: 'choice-toggle',
            label: __('Marketing integration', 'notifima'),
            settingDescription: __(
                'Choose whether to store subscribers locally or automatically sync them with your Mailchimp audience.',
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
                'Generate an API key from your Mailchimp account and paste it here to enable audience synchronization. <a href="https://admin.mailchimp.com/account/api/" target="_blank" rel="noopener noreferrer">Get your API key</a>.',
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
            dependent: {
                key: 'is_mailchimp_enable',
                set: true,
                value: 'mailchimp'
            },
            proSetting: true,
        },
        {
            key: 'section',
            type: 'section',
            icon: 'live-chat',
            title: __('SMS & WhatsApp Notifications', 'notifima'),
            desc: __(
                'Set up text and WhatsApp messages to notify customers when a product is back in stock.',
                'notifima'
            ),
        },
        {
            key: 'notifima_notification_channel',
            type: 'choice-toggle',
            label: __('Notification Channel', 'notifima'),
            settingDescription: __(
                'Choose how product restock notifications should be sent to subscribers.',
                'notifima'
            ),
            options: [
                {
                    key: 'sms',
                    label: __('SMS', 'notifima'),
                    value: 'sms',
                },
                {
                    key: 'whatsapp',
                    label: __('WhatsApp', 'notifima'),
                    value: 'whatsapp',
                },
                {
                    key: 'both',
                    label: __('SMS & WhatsApp', 'notifima'),
                    value: 'both',
                },
            ],
            proSetting: true,
        },
        {
            key: 'notifima_service_provider',
            type: 'choice-toggle',
            label: __('Service Provider', 'notifima'),
            settingDescription: __(
                'Choose the service provider you want to use for sending restock notifications.',
                'notifima'
            ),
            options: [
                {
                    key: 'twilio',
                    label: __('Twilio', 'notifima'),
                    value: 'twilio',
                },
                {
                    key: 'vonage',
                    label: __('Vonage', 'notifima'),
                    value: 'vonage',
                },
            ],
            dependent: {
                key: 'notifima_notification_channel',
                set: true,
            },
            proSetting: true,
        },

        // Twilio
        {
            key: 'twilio_account_sid',
            type: 'text',
            size: 40,
            label: __('Account SID', 'notifima'),
            settingDescription: __(
                'Your Twilio Account SID. Find it in your Twilio Console → Account Info. <a href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer">Get it here</a>.',
                'notifima'
            ),
            dependent: {
                key: 'notifima_service_provider',
                value: 'twilio',
            },
            proSetting: true,
        },
        {
            key: 'twilio_auth_token',
            type: 'text',
            size: 40,
            label: __('Auth Token', 'notifima'),
            settingDescription: __(
                'Private token used to authenticate API requests to your Twilio account. Find it in your Twilio Console → Account Info. <a href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer">Get it here</a>.',
                'notifima'
            ),
            dependent: {
                key: 'notifima_service_provider',
                value: 'twilio',
            },
            proSetting: true,
        },
        {
            key: 'twilio_sms_sender_number',
            type: 'text',
            size: 25,
            label: __('SMS Sender Number', 'notifima'),
            settingDescription: __(
                'Twilio phone number used to send SMS restock notifications.',
                'notifima'
            ),
            dependent: [
                {
                    key: 'notifima_service_provider',
                    value: 'twilio',
                },
                {
                    key: 'notifima_notification_channel',
                    value: ['sms', 'both'],
                },
            ],
            proSetting: true,
        },
        {
            key: 'twilio_whatsapp_sender_number',
            type: 'text',
            size: 25,
            label: __('WhatsApp Sender Number', 'notifima'),
            settingDescription: __(
                'WhatsApp-enabled Twilio number used to send restock notifications.',
                'notifima'
            ),
            dependent: [
                {
                    key: 'notifima_service_provider',
                    value: 'twilio',
                },
                {
                    key: 'notifima_notification_channel',
                    value: ['whatsapp', 'both'],
                },
            ],
            proSetting: true,
        },

        // Vonage SMS
        {
            key: 'vonage_sms_api_key',
            type: 'text',
            size: 40,
            label: __('API Key', 'notifima'),
            settingDescription: __(
                'Vonage API key used to authenticate SMS API requests. <a href="https://dashboard.nexmo.com/" target="_blank" rel="noopener noreferrer">Get it here</a>.',
                'notifima'
            ),
            dependent: [
                {
                    key: 'notifima_service_provider',
                    value: 'vonage',
                },
                {
                    key: 'notifima_notification_channel',
                    value: ['sms', 'both'],
                },
            ],
            proSetting: true,
        },
        {
            key: 'vonage_sms_api_secret',
            type: 'text',
            size: 40,
            label: __('API Secret', 'notifima'),
            settingDescription: __(
                'Vonage API secret used to authenticate SMS API requests. <a href="https://dashboard.nexmo.com/" target="_blank" rel="noopener noreferrer">Get it here</a>.',
                'notifima'
            ),
            dependent: [
                {
                    key: 'notifima_service_provider',
                    value: 'vonage',
                },
                {
                    key: 'notifima_notification_channel',
                    value: ['sms', 'both'],
                },
            ],
            proSetting: true,
        },
        {
            key: 'vonage_sms_sender',
            type: 'text',
            size: 25,
            label: __('SMS Sender', 'notifima'),
            settingDescription: __(
                'Sender name or number used to send SMS restock notifications.',
                'notifima'
            ),
            dependent: [
                {
                    key: 'notifima_service_provider',
                    value: 'vonage',
                },
                {
                    key: 'notifima_notification_channel',
                    value: ['sms', 'both'],
                },
            ],
            proSetting: true,
        },

        // Vonage WhatsApp
        {
            key: 'vonage_whatsapp_application_id',
            type: 'text',
            size: 40,
            label: __('Application ID', 'notifima'),
            settingDescription: __(
                'Vonage Application ID used to authenticate WhatsApp Messages API requests. <a href="https://dashboard.nexmo.com/" target="_blank" rel="noopener noreferrer">Get it here</a>.',
                'notifima'
            ),
            dependent: [
                {
                    key: 'notifima_service_provider',
                    value: 'vonage',
                },
                {
                    key: 'notifima_notification_channel',
                    value: ['whatsapp', 'both'],
                },
            ],
            proSetting: true,
        },
        {
            key: 'vonage_whatsapp_private_key',
            type: 'textarea',
            size: 40,
            label: __('Private Key', 'notifima'),
            settingDescription: __(
                'Private key for your Vonage Application, used to authenticate WhatsApp Messages API requests. <a href="https://dashboard.nexmo.com/" target="_blank" rel="noopener noreferrer">Get it here</a>.',
                'notifima'
            ),
            dependent: [
                {
                    key: 'notifima_service_provider',
                    value: 'vonage',
                },
                {
                    key: 'notifima_notification_channel',
                    value: ['whatsapp', 'both'],
                },
            ],
            proSetting: true,
        },
        {
            key: 'vonage_whatsapp_sender_number',
            type: 'text',
            size: 25,
            label: __('WhatsApp Sender Number', 'notifima'),
            settingDescription: __(
                'WhatsApp-enabled Vonage number used to send restock notifications.',
                'notifima'
            ),
            dependent: [
                {
                    key: 'notifima_service_provider',
                    value: 'vonage',
                },
                {
                    key: 'notifima_notification_channel',
                    value: ['whatsapp', 'both'],
                },
            ],
            proSetting: true,
        },

        //
        {
            key: 'notifima_sms_message',
            type: 'textarea',
            label: __('SMS Message', 'notifima'),
            settingDescription: __(
                'Customize the back-in-stock message sent to subscribers. Available placeholders: {product_name}, {product_url}.',
                'notifima'
            ),
            dependent: {
                key: 'notifima_notification_channel',
                value: ['sms', 'both'],
            },
            proSetting: true,
        },
        {
            key: 'notifima_whatsapp_message',
            type: 'textarea',
            label: __('WhatsApp Message', 'notifima'),
            settingDescription: __(
                'Customize the WhatsApp back-in-stock message sent to subscribers. Available placeholders: {product_name}, {product_url}.',
                'notifima'
            ),
            dependent: {
                key: 'notifima_notification_channel',
                value: ['whatsapp', 'both'],
            },
            proSetting: true,
        },
    ],
};
