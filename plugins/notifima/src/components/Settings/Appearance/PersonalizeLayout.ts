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
    id: 'personalize-layout',
    priority: 2,
    headerTitle: __( 'Personalize Layout', 'notifima' ),
    headerDescription: __( 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet', 'notifima' ),
    headerIcon: 'form',
    submitUrl: 'settings',
    modal: [
        {
			key: 'personalize_layout_template',
			type: 'block-builder',
            blockGroups: REGISTRATION_BLOCK_GROUPS,
            enableTermsBlock: false,
            enableTitleBlock: false,
		},
    ],
};
