import { __ } from '@wordpress/i18n';

export default {
    id: 'email_verification',
    priority: 25,
    name: __('Email Verification', 'mvx-pro'),
    desc: __('Email Verification', 'mvx-pro'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        // Enable Email Verification - Toggle
        {
            key: 'enable_email_verification',
            label: __('Enable Email Verification', 'multivendorx'),
            desc: __('Enable this to require users to verify their email address after registration.', 'multivendorx'),
            type: 'checkbox',
            options: [
                {
                    key: 'enable_email_verification',
                    value: 'enable_email_verification',
                },
            ],
            look: 'toggle',
        },

        // Registration Notice - Textarea
        {
            key: 'registration_notice',
            label: __('Registration Notice', 'multivendorx'),
            desc: __('This message will be displayed on the registration page.', 'multivendorx'),
            type: 'textarea',
            class: 'mvx-setting-textarea',
        },

        // Login Notice - Textarea
        {
            key: 'login_notice',
            label: __('Login Notice', 'multivendorx'),
            desc: __('This message will be shown on the login page.', 'multivendorx'),
            type: 'textarea',
            class: 'mvx-setting-textarea',
        },
    ],
};
