import { __ } from '@wordpress/i18n';

const OPTION_PRESETS = [
    { id: '1', label: 'Manufacture', value: 'manufacture' },
    { id: '2', label: 'Trader', value: 'trader' },
    { id: '3', label: 'Authorized Agent', value: 'authorized_agent' },
];

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
                placeholder: 'Enter your text here',
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
	id: 'wholesale',
	priority: 3,
	headerTitle: __('Wholesale', 'multivendorx'),
	headerDescription: __(
		'Configure rules for wholesale buyers and pricing.',
		'multivendorx'
	),
	headerIcon: 'wholesale1',
	submitUrl: 'settings',
	modal: [
		{
			key: 'wholesale_buyer_verification',
			type: 'choice-toggle',
			label: __('Wholesale buyer verification', 'multivendorx'),
			settingDescription: __(
				'Decide how wholesale buyers are approved before they can access bulk pricing.',
				'multivendorx'
			),
			desc: __(
				'<ul><li>Automatic - Any user registering as a wholesale buyer is instantly approved without admin review.</li><li>Manual - Admin must review and approve each wholesale buyer request before access is granted.</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'automatic',
					label: __('Automatic', 'multivendorx'),
					value: 'automatic',
				},
				{
					key: 'manual',
					label: __('Manual', 'multivendorx'),
					value: 'manual',
				},
			],
			moduleEnabled: 'wholesale',
			proSetting: true,
		},
		{
			key: 'wholesale_price_access',
			type: 'choice-toggle',
			label: __('Who can see wholesale prices', 'multivendorx'),
			settingDescription: __(
				'Choose which users can see wholesale pricing in store catalogs.',
				'multivendorx'
			),
			desc: __(
				'<ul><li>All registered users - Every logged-in customer can see wholesale prices, regardless of approval status.</li><li>Approved wholesale buyers only - Only users approved as wholesale buyers can see wholesale prices.</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'registered',
					label: __('All registered users', 'multivendorx'),
					value: 'registered',
				},
				{
					key: 'wholesale_only',
					label: __('Approved wholesale buyers only', 'multivendorx'),
					value: 'wholesale_only',
				},
			],
			moduleEnabled: 'wholesale',
			proSetting: true,
		},
		{
			key: 'wholesale_price_display',
			type: 'choice-toggle',
			label: __('How wholesale prices are shown', 'multivendorx'),
			settingDescription: __(
				'Control whether wholesale prices are shown alongside retail prices or separately.',
				'multivendorx'
			),
			desc: __(
				'<ul><li>Along with retail prices - Display both retail and wholesale prices side by side, so buyers can compare.</li><li>Wholesale price only - Replace retail pricing with wholesale pricing for eligible buyers.</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'with_retail',
					label: __('Along with retail prices', 'multivendorx'),
					value: 'with_retail',
				},
				{
					key: 'wholesale_price',
					label: __('Wholesale price only', 'multivendorx'),
					value: 'wholesale_price',
				},
			],
			moduleEnabled: 'wholesale',
			proSetting: true,
		},
		{
			key: 'wholesale_registration_from',
			type: 'block-builder',
			classes: 'full-width',
			blockGroups: REGISTRATION_BLOCK_GROUPS,
			visibleGroups: ['registration'],
			desc: 'Customise personalised store registration form for marketplace.',
			moduleEnabled: 'wholesale',
			proSetting: true,
		},
	],
};
