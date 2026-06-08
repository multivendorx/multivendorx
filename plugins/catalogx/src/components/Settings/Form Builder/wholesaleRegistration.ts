import { __ } from '@wordpress/i18n';

const OPTION_PRESETS = [
    { id: '1', label: 'Manufacture', value: 'manufacture' },
    { id: '2', label: 'Trader', value: 'trader' },
    { id: '3', label: 'Authorized Agent', value: 'authorized_agent' },
];

const WHOLESALE_BLOCK_GROUPS = [
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
                id: 'email',
                icon: 'unread',
                value: 'email',
                label: 'Email',
                fixedName: 'Email',
                placeholder: 'Enter your email here',
            },
            {
                id: 'textarea',
                icon: 'text',
                value: 'textarea',
                label: 'Enter your text',
                fixedName: 'Textarea',
                placeholder: 'Enter your message here',
            },
            {
                id: 'date',
                icon: 'calendar',
                value: 'date',
                label: 'Date Picker',
                fixedName: 'Date',
                placeholder: 'Select a date',
            },
            {
                id: 'time',
                icon: 'alarm ',
                value: 'time',
                label: 'Time Picker',
                fixedName: 'Time',
                placeholder: 'Select a time',
            },
            {
                id: 'checkboxes',
                icon: 'checkbox',
                value: 'checkboxes',
                label: 'Nature Of Business',
                fixedName: 'Checkboxes',
                options: OPTION_PRESETS,
            },
            {
                id: 'multi-select',
                icon: 'multi-select',
                value: 'multi-select',
                label: 'Multi Select',
                fixedName: 'Multi Select',
                options: OPTION_PRESETS,
            },
            {
                id: 'radio',
                icon: 'radio icon-form-radio',
                value: 'radio',
                label: 'Nature Of Business',
                fixedName: 'Radio',
                options: OPTION_PRESETS,
            },
            {
                id: 'dropdown',
                icon: 'dropdown-checklist',
                value: 'dropdown',
                label: 'Dropdown',
                fixedName: 'Dropdown',
                options: OPTION_PRESETS,
            },
            {
                id: 'attachment',
                icon: 'submission-message ',
                value: 'attachment',
                label: 'Attachment',
                fixedName: 'Attachment',
            },
            {
                id: 'section',
                icon: 'form-section',
                value: 'section',
                label: 'Section',
                fixedName: 'Section',
            },
            {
                id: 'recaptcha',
                icon: 'captcha-automatic-code',
                value: 'recaptcha',
                label: 'reCaptcha v3',
                fixedName: 'reCaptcha',
            },
            {
                id: 'terms',
                icon: 't-letter-bold',
                value: 'richtext',
                label: 'Terms & Conditions',
                fixedName: 'Terms & Conditions'
            },
        ],
    }
];

export default {
	id: 'wholesale-registration',
    priority: 70,
    headerTitle: __( 'Wholesale', 'catalogx' ),
    headerDescription: __(
        'Drag-and-drop interface to tailor the wholesale registration form.',
        'catalogx'
    ),
    headerIcon: 'contact-form',
    submitUrl: 'settings',
	modal: [
		{
			key: 'registration page',
			type: 'notice',
			message: __(
				'Only store owners can apply for store registration. Applicants must log in or create an account before proceeding. So, Make sure WooCommerce’s Account & Privacy settings are configured to allow user registration.',
				'catalogx'
			),
			noticeType: 'info',
			displayPosition: 'notice',
		},
		{
			key: 'store_registration_from',
			type: 'block-builder',
			classes: 'full-width',
			blockGroups: WHOLESALE_BLOCK_GROUPS,
			visibleGroups: ['registration'],
			desc: 'Customise personalised store registration form for marketplace.',
			context: 'form',
            proSetting: true,
		},
	],
};
