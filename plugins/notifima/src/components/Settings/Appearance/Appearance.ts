import { __, sprintf } from '@wordpress/i18n';
export default {
    id: 'appearance',
    priority: 1,
    headerTitle: __('Appearance', 'notifima'),
    headerDescription: __('Customize stock alert form.', 'notifima'),
    headerIcon: 'appearance',
    submitUrl: 'settings',
    modal: [
        {
            key: 'unsubscribe_button_text',
            type: 'text',
            label: __("'Unsubscribe' Button Caption", 'notifima'),
            settingDescription: __(
                'Customize the text displayed on the unsubscribe button.',
                'multivendorx'
            ),
            desc: __(
                'Default: "Unsubscribe".',
                'multivendorx'
            ),
            size: 20,
            placeholder: __('Unsubscribe', 'notifima'),
        },
        {
            key: 'is_guest_subscriptions_enable',
            type: 'choice-toggle',
            label: __('Who can subscribe', 'notifima'),
            settingDescription: __(
                'Choose which customers are allowed to subscribe for restock notifications.',
                'multivendorx'
            ),
            desc: __(
                '<ul><li>Everyone - Both guest visitors and logged-in customers can subscribe.</li><li>Logged-in customers only - Only authenticated customers can subscribe for restock notifications.</li></ul>',
                'multivendorx'
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
            type: 'choice-toggle',
            label: __('Show subscription form for', 'notifima'),
            settingDescription: __(
                'Choose when the restock subscription form should be displayed.',
                'multivendorx'
            ),
            desc: __(
                '<ul><li>Out of stock products - Display the subscription form only for products that are out of stock.</li><li>Out of stock &amp; backorder products - Display the subscription form for products that are out of stock or available on backorder.</li></ul>',
                'multivendorx'
            ),

            options: [
                {
                    key: 'out_of_stock',
                    label: __('Out of stock products', 'notifima'),
                    value: 'out_of_stock',
                },
                {
                    key: 'out_of_stock_and_backorder',
                    label: __('Out of stock & backorder products', 'notifima'),
                    value: 'out_of_stock_and_backorder',
                },
            ],
        },
        {
            key: 'display_lead_times',
            type: 'checkbox',
            label: __('Stock Status for Lead Time', 'notifima'),
            settingDescription: __(
                'Choose which stock statuses should display the product lead time.',
                'multivendorx'
            ),
            desc: __(
                '<ul><li>Out of stock - Display the lead time only for out-of-stock products.</li><li>On backorder - Display the lead time for products available on backorder.</li></ul>',
                'multivendorx'
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
                'multivendorx'
            ),
            desc: __(
                '<ul><li>Static - Use the same lead time message for all applicable products.</li><li>Dynamic - Use a product-specific lead time message for each product.</li></ul>',
                'multivendorx'
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
            label: __('Lead time static text', 'notifima'),
            settingDescription: __(
                'Enter the default lead time message displayed for products using the static lead time format.',
                'multivendorx'
            ),
            desc: __(
                'This message is shown unless a product-specific lead time is available.',
                'multivendorx'
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
            key: 'is_enable_no_interest',
            type: 'choice-toggle',
            label: __(
                'Subscriber visibility',
                'notifima'
            ),
            settingDescription: __(
                'Choose whether the subscriber count should be displayed on product pages.',
                'multivendorx'
            ),
            desc: __(
                '<ul><li>Hide subscriber count - Customers will not see how many users have subscribed.</li><li>Show subscriber count - Display the current subscriber count on the product page.</li></ul>',
                'multivendorx'
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
                'multivendorx'
            ),
            desc: __(
                '<ul><li>Subscribe immediately - Customers are subscribed as soon as they submit the form.</li><li>Confirm via email - Customers must verify their subscription through a confirmation email before it becomes active.</li></ul>',
                'multivendorx'
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
            label: __('Subscription confirmation message', 'multivendorx'),
            settingDescription: __(
                'Customize the message displayed after a customer submits a subscription request.',
                'multivendorx'
            ),
            desc: __(
                'Used when email confirmation is enabled. Default: "Kindly check your inbox to confirm the subscription."',
                'multivendorx'
            ),
            dependent: {
                key: 'is_double_optin',
                set: true,
                value: 'confirm_via_email',
            },
            proSetting: true,
        },
        {
            key: 'is_recaptcha_enable',
            type: 'choice-toggle',
            label: __('Subscription protection', 'notifima'),

            settingDescription: __(
                'Choose how to protect the subscription form from automated submissions.',
                'multivendorx'
            ),
            desc: __(
                '<ul><li>No Verification - Customers can subscribe without additional verification.</li><li>Google reCAPTCHA - Protect the subscription form using Google reCAPTCHA v3 to reduce spam and automated submissions.</li></ul>',
                'multivendorx'
            ),

            options: [
                {
                    key: 'no_verification',
                    label: __('No Verification', 'notifima'),
                    value: 'no_verification',
                },
                {
                    key: 'recaptcha',
                    label: __('Google recaptcha', 'notifima'),
                    value: 'recaptcha',
                },
            ],
            proSetting: true,
        },
        {
            key: 'v3_site_key',
            type: 'text',
            label: __('Site Key', 'notifima'),
            settingDescription: __(
                'Enter your Google reCAPTCHA v3 Site Key.',
                'multivendorx'
            ),
            desc: __(
                'Required to enable Google reCAPTCHA protection for the subscription form.',
                'multivendorx'
            ),
            dependent: {
                key: 'is_recaptcha_enable',
                set: true,
                value: 'recaptcha',
            },
        },
        {
            key: 'v3_secret_key',
            type: 'text',
            label: __('Secret Key', 'notifima'),
            settingDescription: __(
                'Enter your Google reCAPTCHA v3 Secret Key.',
                'multivendorx'
            ),
            desc: __(
                'Used to verify reCAPTCHA requests submitted through the subscription form.',
                'multivendorx'
            ),
            dependent: {
                key: 'is_recaptcha_enable',
                set: true,
                value: 'recaptcha',
            },
        },
        {
            key: 'additional_alert_email',
            type: 'textarea',
            label: __('Recipient email for new subscriber', 'multivendorx'),
            settingDescription: __(
                'Choose who should receive email notifications when customers subscribe for restock alerts.',
                'multivendorx'
            ),
            desc: __(
                '<ul><li>Separate multiple email addresses with commas.</li><li>By default, the site administrator receives these notifications.</li><li>Remove the administrator\'s email address from the list if you do not want the administrator to receive notifications.</li></ul>',
                'multivendorx'
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
