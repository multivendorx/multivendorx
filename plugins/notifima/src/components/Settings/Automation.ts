import { __ } from '@wordpress/i18n';
export default {
    id: 'automation',
    priority: 1,
    headerTitle: __('Automation', 'notifima'),
    headerDescription: __('Set the automation rules that control customer subscriptions, restock notifications, and lead time behavior.', 'notifima'),
    headerIcon: 'appearance',
    submitUrl: 'settings',
    modal: [

        {
            key: 'is_guest_subscriptions_enable',
            type: 'choice-toggle',
            label: __('Subscription access', 'notifima'),
            settingDescription: __(
                'Choose which customers are allowed to subscribe for restock notifications.',
                'notifima'
            ),
            desc: __(
                '<ul><li>Everyone - Both guest visitors and logged-in customers can subscribe.</li><li>Logged-in customers only - Only authenticated customers can subscribe for restock notifications.</li></ul>',
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
                'Choose when the restock subscription form should be displayed.',
                'notifima'
            ),
            desc: __(
                '<ul><li>Out of stock - Display the subscription form when a product is out of stock.</li><li>On backorder - Display the subscription form when a product is available on backorder.</li></ul>',
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
            title: __('Restock Timing (Lead Time)', 'notifima'),
            desc: __(
                'When and how lead time is shown.',
                'notifima'
            ),
        },
        {
            key: 'display_lead_times',
            type: 'checkbox',
            label: __('Stock Status for Lead Time', 'notifima'),
            settingDescription: __(
                'Choose which stock statuses should display the product lead time.',
                'notifima'
            ),
            desc: __(
                '<ul><li>Out of stock - Display the lead time only for out-of-stock products.</li><li>On backorder - Display the lead time for products available on backorder.</li></ul>',
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
                'Choose how lead time should be displayed on product pages.',
                'notifima'
            ),
            desc: __(
                '<ul><li>Static - Use the same lead time message for all applicable products.</li><li>Dynamic - Use a product-specific lead time message for each product.</li></ul>',
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
                'Enter the default lead time message displayed for products using the static lead time format.',
                'notifima'
            ),
            desc: __(
                'This message is shown unless a product-specific lead time is available.',
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
            title: __('Subscription Experience', 'notifima'),
            desc: __(
                'Customize how customers interact with stock alert subscriptions across your store.',
                'notifima'
            ),
        },
        {
            key: 'display_subscription_form_as',
            type: 'choice-toggle',
            label: __('Display subscription form as', 'notifima'),
            settingDescription: __(
                'Choose how the subscription form is presented to customers.',
                'notifima'
            ),
            desc: __(
                '<ul><li>Popup Window - Open the subscription form in a modal popup.</li><li>Inline on Product Page - Display the subscription form directly within the product page.</li></ul>',
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
                'Choose whether the subscriber count should be displayed on product pages.',
                'notifima'
            ),
            desc: __(
                '<ul><li>Hide subscriber count - Customers will not see how many users have subscribed.</li><li>Show subscriber count - Display the current subscriber count on the product page.</li></ul>',
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
                'Customize the message displayed alongside the subscriber count on product pages.',
                'notifima'
            ),
            desc: __(
                'Use <code>%no_of_subscribed%</code> to display the current number of subscribers. Example: "<code>%no_of_subscribed% customers are waiting for this product.</code>"',
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
                'Choose how customer subscriptions are confirmed.',
                'notifima'
            ),
            desc: __(
                '<ul><li>Subscribe immediately - Customers are subscribed as soon as they submit the form.</li><li>Confirm via email - Customers must verify their subscription through a confirmation email before it becomes active.</li></ul>',
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
                'Customize the message displayed after a customer submits a subscription request.',
                'notifima'
            ),
            desc: __(
                'Used when email confirmation is enabled. Default: "Kindly check your inbox to confirm the subscription."',
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
                'Customize the text displayed on the unsubscribe button for subscribed users.',
                'notifima'
            ),
            desc: __(
                'Default: "Unsubscribe". Shown when a subscribed user revisits an out-of-stock product.',
                'notifima'
            ),
            size: 20,
            placeholder: __('Unsubscribe', 'notifima'),
        },


        // mailchimp
        {
            key: 'section',
            type: 'section',
            title: __('Audience Synchronization', 'notifima'),
            desc: __('Choose where subscriber data is stored and automatically synchronize it with connected platforms.', 'notifima'),
        },
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

        
        //
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
                'Your Twilio account unique identifier used to authenticate API requests.',
                'notifima'
            ),
            desc: __(
                'Found in your Twilio Console → Account Info. <a href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer">Get it here</a>.',
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
                'Private token used to authenticate API requests to your Twilio account.',
                'notifima'
            ),
            desc: __(
                'Found in your Twilio Console → Account Info. <a href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer">Get it here</a>.',
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
                'The Twilio phone number used to send SMS restock notifications.',
                'notifima'
            ),
            desc: __(
                'Enter a Twilio phone number capable of sending SMS messages.',
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
                'The WhatsApp-enabled Twilio number used to send WhatsApp restock notifications.',
                'notifima'
            ),
            desc: __(
                'Enter the WhatsApp-enabled sender number configured in your Twilio account.',
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
                'Your Vonage API key used to authenticate SMS API requests.',
                'notifima'
            ),
            desc: __(
                'Found in your Vonage API dashboard. <a href="https://dashboard.nexmo.com/" target="_blank" rel="noopener noreferrer">Get it here</a>.',
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
                'Your Vonage API secret used to authenticate SMS API requests.',
                'notifima'
            ),
            desc: __(
                'Found in your Vonage API dashboard. <a href="https://dashboard.nexmo.com/" target="_blank" rel="noopener noreferrer">Get it here</a>.',
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
                'The sender name or number used to send SMS restock notifications.',
                'notifima'
            ),
            desc: __(
                'Enter the sender name or number configured for your Vonage SMS service.',
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
                'The Vonage Application ID used to authenticate WhatsApp Messages API requests.',
                'notifima'
            ),
            desc: __(
                'Found in your Vonage Developer Dashboard under Applications. <a href="https://dashboard.nexmo.com/" target="_blank" rel="noopener noreferrer">Get it here</a>.',
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
                'The private key associated with your Vonage Application, used to authenticate WhatsApp Messages API requests.',
                'notifima'
            ),
            desc: __(
                'Use the private key generated for your Vonage Application. <a href="https://dashboard.nexmo.com/" target="_blank" rel="noopener noreferrer">Get it here</a>.',
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
                'The WhatsApp-enabled Vonage number used to send WhatsApp restock notifications.',
                'notifima'
            ),
            desc: __(
                'Enter the WhatsApp sender number configured for your Vonage Messages application.',
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
    ],
};
