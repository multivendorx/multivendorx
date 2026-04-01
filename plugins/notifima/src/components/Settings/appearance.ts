import { __, sprintf } from '@wordpress/i18n';
export default {
    id: 'appearance',
    priority: 1,
    name: __( 'Appearance', 'notifima' ),
    desc: __( 'Customize stock alert form.', 'notifima' ),
    icon: 'adminlib-settings',
    submitUrl: 'settings',
    modal: [
        {
            key: 'subscribe_form',
            type: 'notifima-form-customizer',
            label: __( 'Personalize Layout', 'notifima' ),
        },
        {
            key: 'separator_content',
            type: 'section',
            label: '',
        },
        {
            key: 'unsubscribe_button_text',
            type: 'text',
            label: __( "'Unsubscribe' Button Caption", 'notifima' ),
            desc: __(
                'Modify the un-subscribe button text. By default we display "Unsubscribe".',
                'notifima'
            ),
            placeholder: __( 'Unsubscribe', 'notifima' ),
        },
        {
            key: 'separator_content',
            type: 'section',
            label: '',
        },
        {
            key: 'is_guest_subscriptions_enable',
            type: 'checkbox',
            label: __( 'Guest Subscriptions', 'notifima' ),
            desc: __(
                'Allow guests (non-logged-in users) to subscribe to notifications for out-of-stock products.',
                'notifima'
            ),
            class: 'woo-toggle-checkbox',
            options: [
                {
                    key: 'is_guest_subscriptions_enable',
                    value: 'is_guest_subscriptions_enable',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'is_enable_backorders',
            type: 'checkbox',
            label: __( 'Allow Backorder Subscriptions', 'notifima' ),
            desc: __(
                'Enabling this setting allows users to subscribe to out-of-stock products, even when the backorder option is enabled.',
                'notifima'
            ),
            class: 'woo-toggle-checkbox',
            options: [
                {
                    key: 'is_enable_backorders',
                    value: 'is_enable_backorders',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'separator_content',
            type: 'section',
            label: '',
        },
        {
            key: 'display_lead_times',
            type: 'checkbox',
            label: __( 'Stock Status for Lead Time', 'notifima' ),
            class: 'woo-toggle-checkbox',
            desc: __(
                'Lead time informs customers when a product will be available again. This setting lets you choose which stock statuses will display the restock estimate.',
                'notifima'
            ),
            options: [
                {
                    key: 'outofstock',
                    label: __( 'Out of stock', 'notifima' ),
                    value: 'outofstock',
                },
                {
                    key: 'onbackorder',
                    label: __( 'On backorder', 'notifima' ),
                    value: 'onbackorder',
                },
            ],
        },
        {
            key: 'lead_time_format',
            type: 'setting-toggle',
            label: __( 'Lead Format', 'notifima' ),
            desc: __(
                'Choose the lead time format: Either dynamic (set unique lead time text for all out of stock product) or static (apply a default lead time text for out of stock products).',
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
                    label: __( 'Static', 'notifima' ),
                    value: 'static',
                },
                {
                    key: 'dynamic',
                    label: __( 'Dynamic', 'notifima' ),
                    value: 'dynamic',
                    proSetting: true,
                },
            ],
        },
        {
            key: 'lead_time_static_text',
            type: 'text',
            label: __( 'Lead time static text', 'notifima' ),
            desc: __(
                'This will be the standard message displayed for all out-of-stock products unless a custom lead time is specified.',
                'notifima'
            ),
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
            key: 'separator_content',
            type: 'section',
            label: '',
        },
        {
                    key: 'product_discontinued_text',
                    type: 'text',
                    label: __( "Product Discontinued Message", 'notifima' ),
                    desc: __(
                        'Modify the product discontinued text.',
                        'notifima'
                    ),
                    placeholder: __( 'This product has been discontinued.', 'notifima' ),
                },
        {
            key: 'separator_content',
            type: 'section',
            label: '',
        },
        {
            key: 'is_enable_no_interest',
            type: 'checkbox',
            label: __(
                'Display subscriber count for out of stock',
                'notifima'
            ),
            desc: __(
                'Enabling this setting shows the subscriber count on the single product page.',
                'notifima'
            ),
            class: 'woo-toggle-checkbox',
            options: [
                {
                    key: 'is_enable_no_interest',
                    value: 'is_enable_no_interest',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'shown_interest_text',
            type: 'textarea',
            label: __( 'Subscriber count notification message', 'notifima' ),
            desc: __(
                'Personalize the notification text to let users know about the quantity of subscribers for out-of-stock item. Note: Use %no_of_subscribed% as number of interest/subscribed persons.',
                'notifima'
            ),
            dependent: {
                key: 'is_enable_no_interest',
                set: true,
            },
        },
        {
            key: 'separator_content',
            type: 'section',
            label: '',
        },
        {
            key: 'is_double_optin',
            type: 'checkbox',
            class: 'woo-toggle-checkbox',
            label: __( 'Subscriber double opt-in', 'notifima' ),
            desc: ! appLocalizer.khali_dabba
                ? sprintf(
                      /* translators: %s is the Pro upgrade URL */
                      __(
                          'Upgrade to <a href="%s" target="_blank"><span class="pro-strong">Pro</span></a> to enable Double Opt-in flow for subscription confirmation.',
                          'notifima'
                      ),
                      appLocalizer.pro_url
                  )
                : __(
                      'Enable Double Opt-in flow for subscription confirmation.',
                      'notifima'
                  ),
            options: [
                {
                    key: 'is_double_optin',
                    value: 'is_double_optin',
                },
            ],
            proSetting: true,
            look: 'toggle',
        },
        {
            key: 'double_opt_in_success',
            type: 'textarea',
            desc: __(
                'Default: Kindly check your inbox to confirm the subscription.',
                'notifima'
            ),
            label: __( 'Double opt-in success message', 'notifima' ),
            dependent: {
                key: 'is_double_optin',
                set: true,
            },
            proSetting: true,
        },
        {
            key: 'separator_content',
            type: 'section',
            label: '',
        },
        {
            key: 'is_recaptcha_enable',
            type: 'checkbox',
            label: __( 'Enable reCaptcha', 'notifima' ),
            class: 'woo-toggle-checkbox',
            desc: ! appLocalizer.khali_dabba
                ? sprintf(
                      /* translators: %s is the Pro upgrade URL */
                      __(
                          'Upgrade to <a href="%s" target="_blank"><span class="pro-strong">Pro</span></a> for unlocking reCAPTCHA for out-of-stock form subscriptions.',
                          'notifima'
                      ),
                      appLocalizer.pro_url
                  )
                : __(
                      'Enable this to prevent automated bots from submitting forms. Get your v3 reCAPTCHA site key and secret key from <a href="https://developers.google.com/recaptcha" target="_blank">here</a>.',
                      'notifima'
                  ),
            options: [
                {
                    key: 'is_recaptcha_enable',
                    value: 'is_recaptcha_enable',
                },
            ],
            proSetting: true,
            look: 'toggle',
        },
        {
            key: 'v3_site_key',
            type: 'text',
            label: __( 'Site Key', 'notifima' ),
            dependent: {
                key: 'is_recaptcha_enable',
                set: true,
            },
        },
        {
            key: 'v3_secret_key',
            type: 'text',
            label: __( 'Secret Key', 'notifima' ),
            dependent: {
                key: 'is_recaptcha_enable',
                set: true,
            },
        },
        {
            key: 'separator_content',
            type: 'section',
            label: '',
        },
        {
            key: 'additional_alert_email',
            type: 'textarea',
            desc: __(
                "Set the email address to receive notifications when a user subscribes to an out-of-stock product. You can add multiple comma-separated emails.<br/> Default: The admin's email is set as the receiver. Exclude the admin's email from the list to exclude admin from receiving these notifications.",
                'notifima'
            ),
            label: __( 'Recipient email for new subscriber', 'notifima' ),
        },
        {
            key: 'note_blocktext',
            type: 'blocktext',
            label: 'no_label',
            blocktext:
                'Disclaimer – Loco Translator Compatibility: This plugin allows you to customize certain frontend text settings and descriptions. Default texts are Loco Translator-ready, but any changes made in the corresponding custom text box will no longer be available for translation via Loco Translator. Hence, please enter the customized text in your desired language only.',
        },
    ],
};
