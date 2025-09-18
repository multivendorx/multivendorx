import { __ } from '@wordpress/i18n';

export default {
    id: 'identity-verification',
    priority: 3,
    name: __('Verification', 'mvx-pro'),
    desc: __(
        'Seller verification confirms a store identity with address, contact, and social profiles-building trust and boosting buyer confidence.','mvx-pro'),
    icon: 'adminlib-verification',
    submitUrl: 'settings',

    modal: [
        {
            key: 'badge_img',
            type: 'setting-toggle',
            label: __('Verified badge', 'multivendorx'),
            desc: __(
                'Select a badge from the list above. Once a store is verified, the chosen badge will appear beside its name.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'icon1',
                    value: __('icon1', 'multivendorx'),
                    icon: 'adminlib-verification1',
                },
                {
                    key: 'icon2',
                    value: __('icon2', 'multivendorx'),
                    icon: 'adminlib-verification2',
                },
                {
                    key: 'icon3',
                    value: __('icon3', 'multivendorx'),
                    icon: 'adminlib-verification3',
                },
                {
                    key: 'icon4',
                    value: __('icon4', 'multivendorx'),
                    icon: 'adminlib-verification5',
                },
                // {
                //     key: 'icon5',
                //     value: __('icon5', 'multivendorx'),
                //     icon: 'adminlib-verification6',
                // },
                {
                    key: 'icon6',
                    value: __('icon6', 'multivendorx'),
                    icon: 'adminlib-verification7',
                },
                // {
                //     key: 'icon7',
                //     value: __('icon7', 'multivendorx'),
                //     icon: 'adminlib-verification8',
                // },
                {
                    key: 'icon8',
                    value: __('icon8', 'multivendorx'),
                    icon: 'adminlib-verification9',
                },
            ],
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
                    proSetting:true,
                },
                {
                    key: 'redirect_verification_page',
                    label: __('Redirect to verification page', 'mvx-pro'),
                    value: 'redirect_verification_page',
                    proSetting:true,
                },
                {
                    key: 'disable_add_product_endpoint',
                    label: __('Prevent product upload', 'mvx-pro'),
                    value: 'disable_add_product_endpoint',
                    proSetting:true,
                },
            ],
            //proSetting:true,
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
            key: 'all_verification_methods',
            type: 'payment-tabs',
            modal: [
                {
                    id:'id-verification',
                    icon: "adminlib-verification3",
                    label: 'Identity Verification',
                    connected: false,
                    desc: 'Verify store identity using government-issued documents or facial recognition. Ensures authenticity of users.',
                    wrapperClass: 'add-method',
                    formFields: [
                        {
                            key: 'verification_methods',
                            type: 'verification-methods', // custom type
                            label: 'Verification Methods',
                            addButtonLabel: 'Add New Method',
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
                    icon: "adminlib-mail",
                    label: 'Email Verification',
                    connected: true,
                    desc: 'Verify stores email addresses to prevent fake registrations and enhance security.',
                    formFields: [
                        {
                            key: 'registration_notice',
                            label: __('Registration Notice', 'multivendorx'),
                            desc: __('Displayed after registration until email verification is completed.', 'multivendorx'),
                            type: 'textarea',
                            class: 'mvx-setting-textarea',
                        },
                        {
                            key: 'login_notice',
                            label: __('Login Notice', 'multivendorx'),
                            desc: __('Displayed if login is attempted before email verification.', 'multivendorx'),
                            type: 'textarea',
                            class: 'mvx-setting-textarea',
                        },
                    ],
                },
                {
                    id:'social-verification',
                    icon: "adminlib-social-share",
                    label: 'Social Verification',
                    connected: true,
                    desc: 'Allow stores to verify their identity by connecting social media accounts.',
                    wrapperClass: 'social-verification',
                    formFields: [
                        {
                            key: 'social_verification_methods',
                            type: 'payment-tabs',
                            modal: [
                                {
                                    id:'google-connect',
                                    icon: "adminlib-google",
                                    label: 'Google Connect',
                                    connected: false,
                                    desc: 'Connect and authenticate stores via Google accounts.',
                                    formFields: [
                                        { key: 'client_id', type: 'text', label: 'Google Client ID', placeholder: 'Enter Google Client ID' },
                                        { key: 'client_secret', type: 'password', label: 'Google Client Secret', placeholder: 'Enter Google Client Secret' },
                                        { key: 'redirect_uri', type: 'text', label: 'Redirect URI', placeholder: 'Enter Redirect URI' }
                                    ],
                                },
                                {
                                    id:'twitter-connect',
                                    icon: "adminlib-twitter",
                                    label: 'Twitter Connect',
                                    connected: false,
                                    desc: 'Connect and authenticate stores via Twitter accounts.',
                                    formFields: [
                                        { key: 'api_key', type: 'text', label: 'Twitter API Key', placeholder: 'Enter Twitter API Key' },
                                        { key: 'api_secret_key', type: 'password', label: 'Twitter API Secret Key', placeholder: 'Enter Twitter API Secret Key' },
                                        { key: 'bearer_token', type: 'text', label: 'Bearer Token', placeholder: 'Enter Bearer Token' },
                                    ],
                                },
                                {
                                    id:'facebook-connect',
                                    icon: "adminlib-facebook",
                                    label: 'Facebook Connect',
                                    connected: false,
                                    desc: 'Connect and authenticate stores via Facebook accounts.',
                                    formFields: [
                                        { key: 'app_id', type: 'text', label: 'Facebook App ID', placeholder: 'Enter Facebook App ID' },
                                        { key: 'app_secret', type: 'password', label: 'Facebook App Secret', placeholder: 'Enter Facebook App Secret' },
                                    ],
                                },
                                {
                                    id:'linkedin-connect',
                                    icon: "adminlib-linkedin",
                                    label: 'LinkedIn Connect',
                                    connected: false,
                                    desc: 'Connect and authenticate stores via LinkedIn accounts.',
                                    formFields: [
                                        { key: 'client_id', type: 'text', label: 'LinkedIn Client ID', placeholder: 'Enter LinkedIn Client ID' },
                                        { key: 'client_secret', type: 'password', label: 'LinkedIn Client Secret', placeholder: 'Enter LinkedIn Client Secret' },
                                        { key: 'redirect_uri', type: 'text', label: 'Redirect URI', placeholder: 'Enter Redirect URI' },
                                    ],
                                }
                            ]
                        }
                    ],
                },
            ],
            //proSetting:true
        },
    ],
};
