import { __ } from '@wordpress/i18n';

export default {
    id: 'store-registration-form',
    priority: 2,
    name: 'Store Registration Form',
    desc: __(
        'Customise personalised store registration form for marketplace.',
        'multivendorx'
    ),
    icon: 'adminlib-form-section',
    submitUrl: 'settings',
    modal: [
        {
            key: 'registration page',
            type: 'blocktext',
            label: __('no_label', 'multivendorx'),
            blocktext: __(
                'Username and Password fileds display as per WooCommerce settings',
                'multivendorx'
            ),
        },
        {
            key: 'store_registration_from',
            type: 'form-builder',
            desc: 'Customise personalised store registration form for marketplace.',
        },
        // {
        //     key: 'disable_setup_wizard',
        //     type: 'checkbox',
        //     label: __( 'Disable Wizard', 'multivendorx' ),
        //     desc: __(
        //         'Enable this to disable the setup wizard for stores. When disabled, stores will not be shown the onboarding steps after registration or login.',
        //         'multivendorx'
        //     ),
        //     options: [
        //         {
        //             key: 'disable_setup_wizard',
        //             value: 'disable_setup_wizard',
        //         },
        //     ],
        //     look: 'toggle',
        // },        
        // {
        //     key: 'setup_wizard_introduction',
        //     type: 'textarea',
        //     label: __(
        //         'Store Setup wizard Introduction Message',
        //         'multivendorx'
        //     ),
        //     desc: __(
        //         'Welcome stores with creative onboard messages',
        //         'multivendorx'
        //     ),
        // },
        
    ],
};
