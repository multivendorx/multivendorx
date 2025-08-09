import { __ } from '@wordpress/i18n';

export default {
    id: 'onboarding',
    priority: 2,
    name: 'Onboarding',
    desc: __(
        'Customise personalised seller registration form for marketplace.',
        'multivendorx'
    ),
    icon: 'adminlib-form-section',
    submitUrl: 'settings',
    modal: [
        {
            key: 'approve_seller',
            type: 'setting-toggle',
            label: __( 'Approve Seller', 'multivendorx' ),
            desc: __(
                'Decide how you want to approve new sellers for your marketplace: <li>Manual Approval: Review and approve sellers manually. <li>Automatic Approval: Automatically approve sellers without review.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'manually',
                    label: __( 'Manually', 'multivendorx' ),
                    value: 'manually',
                },
                {
                    key: 'automatically',
                    label: __( 'Automatically', 'multivendorx' ),
                    value: 'automatically',
                },
            ],
        },
        {
            key: 'vendors_backend_access',
            type: 'checkbox',
            label: __( "Seller's Backend Access", 'multivendorx' ),
            desc: __(
                'Allow sellers to access the full WordPress backend with an integrated dashboard to manage products, orders, and more from one place.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'vendors_backend_access',
                    value: 'vendors_backend_access',
                },
            ],
            look: 'toggle',
            proSetting: true,
        },

        {
            key: 'disable_setup_wizard',
            type: 'checkbox',
            label: __( 'Disable Wizard', 'multivendorx' ),
            desc: __(
                'Enable this to disable the setup wizard for vendors. When disabled, vendors will not be shown the onboarding steps after registration or login.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'disable_setup_wizard',
                    value: 'disable_setup_wizard',
                },
            ],
            look: 'toggle',
        },        
        {
            key: 'setup_wizard_introduction',
            type: 'textarea',
            label: __(
                'Vendor Setup wizard Introduction Message',
                'multivendorx'
            ),
            desc: __(
                'Welcome vendors with creative onboard messages',
                'multivendorx'
            ),
        },
    ],
};
