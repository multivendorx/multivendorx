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
                    label: __( 'Manual', 'multivendorx' ),
                    value: 'manually',
                },
                {
                    key: 'automatically',
                    label: __( 'Automatic', 'multivendorx' ),
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
                'Help vendors set up their store quickly with a guided, step-by-step process after registration.<ul><li>Enabled — The setup wizard will not appear. Stores must configure their store manually from the dashboard.</li></ul>',
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
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'store_profile_setup',
                    label: __( 'Store profile', 'multivendorx' ),
                    desc: __( 'Store owners must provide: store name, business description, logo upload, basic branding information', 'multivendorx' ),
                    value: 'store_profile_setup',
                },
                {
                    key: 'payment_information',
                    label: __( 'Payment information', 'multivendorx' ),
                    desc: __( 'Requires stores to set up, payout methods (bank account/ PayPal / Stripe etc.)', 'multivendorx' ),
                    value: 'payment_information',
                }, 
                {
                    key: 'shipping_configuration',
                    label: __( 'Shipping setup', 'multivendorx' ),
                    desc: __( 'Forces stores to complete : Geographic shipping zones, delivery rates and pricing, ', 'multivendorx' ),
                    value: 'shipping_configuration',
                },
                {
                    key: 'first_product_upload',
                    label: __( 'First product', 'multivendorx' ),
                    desc: __( 'Mandates that store to upload at least one product listing, complete product details before going live, ensures the store is not empty when launched', 'multivendorx' ),
                    value: 'first_product_upload',
                },
                {
                    key: 'identity_verification',
                    label: __( 'Identity verification', 'multivendorx' ),
                    desc: __( 'Requires stores to submit government-issued documents, business address verification, Know Your Customer (KYC) compliance', 'multivendorx' ),
                    value: 'identity_verification',
                },
                {
                    key: 'store_policies',
                    label: __( 'Store policies', 'multivendorx' ),
                    desc: __( 'Requires merchants to outline refund rules, shipping terms, and general conditions.', 'multivendorx' ),
                    value: 'store_policies',
                },
            ],
            selectDeselect: true,
        },                
        {
            key: 'setup_wizard_introduction',
            type: 'textarea',
            label: __( 'Getting started message', 'multivendorx' ),
            value: __(
                `Welcome aboard, [Store Name]!\nWe’ll guide you through the essential steps to launch your store on [${appLocalizer.marketplace_site}].`,
                'multivendorx'
              ),                          
            desc: __(
                'This message appears at the beginning of the setup process to set expectations and encourage completion.',
                'multivendorx'
            ),
        },
    ],
};
