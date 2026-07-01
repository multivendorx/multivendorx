import { __ } from '@wordpress/i18n';
export default {
    id: 'appearance',
    priority: 1,
    headerTitle: __('Restock alerts setup', 'notifima'),
    headerDescription: __('Configure how customers subscribe to restock notifications.', 'notifima'),
    headerIcon: 'appearance',
    submitUrl: 'settings',
    modal: [
        {
            key: 'unsubscribe_button_text',
            type: 'text',
            label: __("'Unsubscribe' Button Caption", 'notifima'),
            settingDescription: __(
                'Customize the text displayed on the unsubscribe button.',
                'notifima'
            ),
            desc: __(
                'Default: "Unsubscribe".',
                'notifima'
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
            type: 'choice-toggle',
            label: __('Show subscription form for', 'notifima'),
            settingDescription: __(
                'Choose when the restock subscription form should be displayed.',
                'notifima'
            ),
            desc: __(
                '<ul><li>Out of stock products - Display the subscription form only for products that are out of stock.</li><li>Out of stock &amp; backorder products - Display the subscription form for products that are out of stock or available on backorder.</li></ul>',
                'notifima'
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
            key: 'section',
            type: 'section',
            title: __('Restock Timing (Lead Time)', 'catalogx'),
            desc: __(
                'when and how lead time is shown',
                'catalogx'
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
            title: __('Confirm the subscriber', 'catalogx'),
            desc: __(
                'Make sure every subscriber is real and opted-in.',
                'catalogx'
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
            key: 'section',
            type: 'section',
            title: __('Admin Notifications', 'catalogx'),
            desc: __('Who on your team gets alerted', 'catalogx'
            ),
        },
        {
            key: 'additional_alert_email',
            type: 'textarea',
            label: __('Recipient email for new subscriber', 'notifima'),
            settingDescription: __(
                'Choose who should receive email notifications when customers subscribe for restock alerts.',
                'notifima'
            ),
            desc: __(
                '<ul><li>Separate multiple email addresses with commas.</li><li>By default, the site administrator receives these notifications.</li><li>Remove the administrator\'s email address from the list if you do not want the administrator to receive notifications.</li></ul>',
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
