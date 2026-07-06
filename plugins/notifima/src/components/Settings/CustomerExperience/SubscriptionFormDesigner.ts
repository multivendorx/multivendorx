import { __ } from '@wordpress/i18n';

const REGISTRATION_BLOCK_GROUPS = [
    {
        id: 'registration',
        label: 'Blocks',
        icon: 'user',
        blocks: [
            {
                id: 'text',
                icon: 't-letter-bold',
                value: 'text',
                label: 'Enter the text',
                fixedName: 'Text',
                placeholder: 'Enter your name here',
            },
            {
                id: 'recaptcha',
                icon: 'captcha-automatic-code',
                value: 'recaptcha',
                label: 'reCaptcha v3',
                fixedName: 'reCaptcha',
            },
        ],
    }
];

export default {
    id: 'subscription-form-designer',
    priority: 1,
    headerTitle: __('Subscription Form Designer', 'notifima'),
    headerDescription: __('Customize the subscription form layout.', 'notifima'),
    headerIcon: 'form',
    submitUrl: 'settings',
    modal: [
        {
            key: 'form_tabs',
            type: 'tab',
            classes: 'full-width',
            tabs: [
                {
                    key: 'free_form',
                    label: __('Free', 'notifima'),
                    content: [
                        {
                            key: 'section',
                            type: 'section'
                        },
                        {
                            key: 'email_input',
                            type: 'text',
                            size: 20,
                            placeholder: __('Enter Your Email', 'notifima'),
                            readOnly: true,
                        },
                        {
                            key: 'submit_button',
                            type: 'button',
                            text: __('Notify Me', 'notifima'),
                            color: 'purple-bg',
                        },
                    ],
                },
                {
                    key: 'pro_form',
                    label: __('Pro', 'notifima'),
                    content: [
                        {
                            key: 'personalize_layout_template',
                            type: 'block-builder',
                            blockGroups: REGISTRATION_BLOCK_GROUPS,
                            enableDefaultBlocks: false,
                            proSetting: true,
                        },
                    ],
                },
            ],
        },
    ],
};
