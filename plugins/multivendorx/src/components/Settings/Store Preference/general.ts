import { __ } from '@wordpress/i18n';

export default {
    id: 'general',
    priority: 1,
    name: __( 'Onboarding', 'multivendorx' ),
    desc: __(
        'Decide what vendors see first after signing up and guide them through the key steps to get their store ready for sales.',
        'multivendorx'
    ),
    icon: 'adminlib-storefront',
    submitUrl: 'settings',
    modal: [
        {
            key: 'approve_store',
            type: 'setting-toggle',
            label: __( 'New store registration approval', 'multivendorx' ),
            desc: __(
                'Decide how you want to approve new stores for your marketplace:<ul><li>Manual approval — Admin reviews and approves each store before granting dashboard access.</li><li>Automatic approval — Stores get immediate dashboard access and can start setting up right away.</li></ul>',
                'multivendorx'
            ),
            options: [
                {
                    key: 'manually',
                    label: __( 'Manual approval', 'multivendorx' ),
                    value: 'manually',
                },
                {
                    key: 'automatically',
                    label: __( 'Automatic approval', 'multivendorx' ),
                    value: 'automatically',
                },
            ],
        },
        {
            key: 'section',
            type: 'section',
            hint: __( 'Setup wizard', 'multivendorx' ),
        }, 
        {
            key: 'disable_setup_wizard',
            type: 'setting-toggle',
            label: __( 'Guided setup wizard', 'multivendorx' ),
            desc: __(
                'Help vendors set up their store quickly with a guided, step-by-step process after registration.<ul><li>Enabled — Vendors see a setup wizard with clear instructions for each step.</li><li>Disabled — Vendors configure their store manually at their own pace.</li></ul>',
                'multivendorx'
            ),
            options: [
                {
                    key: 'enable_guided_setup',
                    label: __( 'Enabled', 'multivendorx' ),
                    value: 'enable_guided_setup',
                },
                {
                    key: 'skip_to_dashboard',
                    label: __( 'Disabled', 'multivendorx' ),
                    value: 'skip_to_dashboard',
                },
            ],
        },
        {
            key: 'onboarding_steps_configuration',
            type: 'checkbox',
            label: __( 'Onboarding steps', 'multivendorx' ),
            desc: __( 'Choose which steps vendors must complete before they can start selling.', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'store_profile_setup',
                    label: __( 'Store profile', 'multivendorx' ),
                    desc: __( 'Add a store name, description, and logo.', 'multivendorx' ),
                    value: 'store_profile_setup',
                },
                {
                    key: 'payment_information',
                    label: __( 'Payment information', 'multivendorx' ),
                    desc: __( 'Enter payout details such as bank or PayPal info, and provide tax details.', 'multivendorx' ),
                    value: 'payment_information',
                },
                {
                    key: 'shipping_configuration',
                    label: __( 'Shipping setup', 'multivendorx' ),
                    desc: __( 'Define shipping zones, set delivery rates, and add policies.', 'multivendorx' ),
                    value: 'shipping_configuration',
                },
                {
                    key: 'first_product_upload',
                    label: __( 'First product', 'multivendorx' ),
                    desc: __( 'Upload at least one product to make the store active and visible to customers.', 'multivendorx' ),
                    value: 'first_product_upload',
                },
                {
                    key: 'identity_verification',
                    label: __( 'Identity verification', 'multivendorx' ),
                    desc: __( 'Submit documents or address details for verification.', 'multivendorx' ),
                    value: 'identity_verification',
                },
                {
                    key: 'store_policies',
                    label: __( 'Store policies', 'multivendorx' ),
                    desc: __( 'Outline refund rules, shipping terms, and general conditions.', 'multivendorx' ),
                    value: 'store_policies',
                },
            ],
            selectDeselect: true,
        },                
        {
            key: 'setup_wizard_introduction',
            type: 'textarea',
            label: __( 'Getting started message', 'multivendorx' ),
            placeholder: __(
                'Welcome aboard, [Store Name]! We’ll guide you through the essential steps to launch your store on [Marketplace Name].',
                'multivendorx'
            ),            
            desc: __(
                'This message appears at the beginning of the setup process to set expectations and encourage completion.',
                'multivendorx'
            ),
        },
    ],
};
