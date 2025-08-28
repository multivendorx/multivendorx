import { __ } from '@wordpress/i18n';
import payPal from '../../../assets/images/paypal.png';
import email from '../../../assets/images/email.png';
import social from '../../../assets/images/social.png';
import google from '../../../assets/images/google.png';



export default {
    id: 'identity-verification',
    priority: 7,
    name: __('Verification', 'mvx-pro'),
    desc: __(
        'Enable various forms of identity verification for stores and ensure a trusted marketplace.',
        'mvx-pro'
    ),
    icon: 'adminlib-clock2',
    submitUrl: 'settings',

    modal: [
        {
            key: 'badge_img',
            type: 'file',
            label: __('Verified badge', 'mvx-pro'),
            width: 75,
            height: 75,
            desc: __(
                'Upload (32px height) size badge that will appear next to verified stores for credibility.',
                'mvx-pro'
            ),
        },
        {
            key: 'unverified_store_access',
            type: 'checkbox',
            label: __('Unverified restrictions', 'mvx-pro'),
            desc: __('Select the restrictions you want to apply to stores who have not yet completed their verification process.', 'mvx-pro'),
            options: [
                {
                    key: 'endpoint_control',
                    label: __('Restrict access to other pages', 'mvx-pro'),
                    value: 'endpoint_control',
                },
                {
                    key: 'redirect_verification_page',
                    label: __('Redirect to verification page', 'mvx-pro'),
                    value: 'redirect_verification_page',
                },
                {
                    key: 'disable_add_product_endpoint',
                    label: __('Prevent product upload', 'mvx-pro'),
                    value: 'disable_add_product_endpoint',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Verification Method ',
                'multivendorx'
            ),
        },
        {
            key: 'payment_methods',
            type: 'payment-tabs',
            modal: [
                {
                    id:'id-verification',
                    icon: payPal,
                    label: 'Identity Verification',
                    connected: false,
                    desc: 'Verify user identity using government-issued documents or facial recognition. Ensures authenticity of users.',
                    wrapperClass: 'add-method',
                    formFields: [
                        {
                            key: 'verification_methods',
                            type: 'verification-methods', // custom type
                            label: 'Verification Methods',
                            addButtonLabel: 'Add Verification Method',
                            deleteButtonLabel: 'Remove',
                            nestedFields: [
                                { key: 'label', type: 'text', label: 'Label', placeholder: 'Enter label' },
                                { key: 'required', type: 'checkbox', label: 'Required' },
                                { key: 'active', type: 'checkbox', label: 'Active' },
                            ],
                        },
                    ],
                },
                {
                    id:'email-verification',
                    icon: email,
                    label: 'Email Verification',
                    connected: true,
                    desc: 'Verify user email addresses to prevent fake registrations and enhance security.',
                    formFields: [
                        {
                            key: 'registration_notice',
                            label: __('Registration Notice', 'multivendorx'),
                            desc: __('This message will be displayed on the registration page.', 'multivendorx'),
                            type: 'textarea',
                            class: 'mvx-setting-textarea',
                        },
                        {
                            key: 'login_notice',
                            label: __('Login Notice', 'multivendorx'),
                            desc: __('This message will be shown on the login page.', 'multivendorx'),
                            type: 'textarea',
                            class: 'mvx-setting-textarea',
                        },
                    ],
                },
                {
                    id:'social-verification',
                    icon: social,
                    label: 'Social Verification',
                    connected: true,
                    desc: 'Verify user email addresses to prevent fake registrations and enhance security.',
                    wrapperClass: 'social-verification',
                    formFields: [
                        {
                            key: 'payment_methods',
                            type: 'payment-tabs',
                            modal: [
                                {
                                    id:'google-connect',
                                    icon: google,
                                    label: 'Google Connect',
                                    connected: false,
                                    desc: 'Connect and authenticate users via Google accounts.',
                                    formFields: [
                                        { key: 'client_id', type: 'text', label: 'Google Client ID', placeholder: 'Enter Google Client ID' },
                                        { key: 'client_secret', type: 'password', label: 'Google Client Secret', placeholder: 'Enter Google Client Secret' },
                                        { key: 'redirect_uri', type: 'text', label: 'Redirect URI', placeholder: 'Enter Redirect URI' },
                                        { key: 'enable', type: 'checkbox', label: 'Enable Google Connect' }
                                    ],
                                },
                                {
                                    id:'twitter-connect',
                                    icon: google,
                                    label: 'Twitter Connect',
                                    connected: false,
                                    desc: 'Connect and authenticate users via Twitter accounts.',
                                    formFields: [
                                        { key: 'api_key', type: 'text', label: 'Twitter API Key', placeholder: 'Enter Twitter API Key' },
                                        { key: 'api_secret_key', type: 'password', label: 'Twitter API Secret Key', placeholder: 'Enter Twitter API Secret Key' },
                                        { key: 'bearer_token', type: 'text', label: 'Bearer Token', placeholder: 'Enter Bearer Token' },
                                        { key: 'enable', type: 'checkbox', label: 'Enable Twitter Connect' }
                                    ],
                                },
                                {
                                    id:'facebook-connect',
                                    icon: google,
                                    label: 'Facebook Connect',
                                    connected: false,
                                    desc: 'Connect and authenticate users via Facebook accounts.',
                                    formFields: [
                                        { key: 'app_id', type: 'text', label: 'Facebook App ID', placeholder: 'Enter Facebook App ID' },
                                        { key: 'app_secret', type: 'password', label: 'Facebook App Secret', placeholder: 'Enter Facebook App Secret' },
                                        { key: 'enable', type: 'checkbox', label: 'Enable Facebook Connect' }
                                    ],
                                },
                                {
                                    id:'linkedin-connect',
                                    icon: google,
                                    label: 'LinkedIn Connect',
                                    connected: false,
                                    desc: 'Connect and authenticate users via LinkedIn accounts.',
                                    formFields: [
                                        { key: 'client_id', type: 'text', label: 'LinkedIn Client ID', placeholder: 'Enter LinkedIn Client ID' },
                                        { key: 'client_secret', type: 'password', label: 'LinkedIn Client Secret', placeholder: 'Enter LinkedIn Client Secret' },
                                        { key: 'redirect_uri', type: 'text', label: 'Redirect URI', placeholder: 'Enter Redirect URI' },
                                        { key: 'enable', type: 'checkbox', label: 'Enable LinkedIn Connect' }
                                    ],
                                }
                            ]
                        }
                    ],
                },
            ]
        },
    ],
};
