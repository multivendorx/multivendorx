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
    },
    // {
    //     id: 'store',
    //     label: 'Store',
    //     icon: 'store',
    //     blocks: [
    //         {
    //             id: 'name',
    //             icon: 't-letter-bold',
    //             value: 'text',
    //             label: 'Store Name',
    //             fixedName: 'Name',
    //             placeholder: 'Enter your house name',
    //         },
    //         {
    //             id: 'description',
    //             icon: 'text ',
    //             value: 'textarea',
    //             label: 'Store Desc',
    //             fixedName: 'Description',
    //             placeholder: 'Enter your store description',
    //         },
    //         {
    //             id: 'store-phone',
    //             icon: 'form-phone',
    //             value: 'text',
    //             label: 'Store Phone',
    //             fixedName: 'Phone',
    //             placeholder: 'Enter your store phone',
    //         },
    //         {
    //             id: 'store-paypal',
    //             icon: 'unread ',
    //             value: 'email',
    //             label: 'Store Paypal Email',
    //             fixedName: 'Paypal Email',
    //             placeholder: 'Enter your PayPal email',
    //         },
    //         {
    //             id: 'store-address',
    //             icon: 'form-address ',
    //             value: 'address',
    //             label: 'Store Address',
    //             fixedName: 'Address',
    //         },
    //     ],
    // }
];

export default {
    id: 'enquiry-form-customization',
    priority: 30,
    headerTitle: __('Enquiry Form Builder', 'catalogx'),
    headerDescription: __(
        'Design a personalized enquiry form with built-in form builder.',
        'catalogx'
    ),
    headerIcon: 'contact-form',
    submitUrl: 'settings',

    modal: [
        {
            key: 'enquiry_form_tabs',
            type: 'tab',
            tabs: [
                {
					key: 'free_form',
                    label: __('Free', 'catalogx'),
                    content: [
                        {
                            key: 'free_enquiry_form',
                            type: 'free-form',
                            label: __('Free Form Content', 'catalogx'),
                            desc: __('Simple textarea for free users.', 'catalogx'),
                            placeholder: __('Write something...', 'catalogx'),
                        },
                    ],
                },

                {
					key: 'pro_form',
                    label: __('Pro', 'catalogx'),
                    content: [
                        {
                            key: 'enquiry_form_builder',
                            type: 'block-builder',
							blockGroups: REGISTRATION_BLOCK_GROUPS,
							visibleGroups: ['registration', 'store'],
                            classes: 'full-width',
                            desc: __('Customise personalised enquiry form.', 'catalogx'),
                            context:'form',
                            proSetting: true,
                        },
                    ],
					proSetting:true,
                },
            ],
        },
    ],
};