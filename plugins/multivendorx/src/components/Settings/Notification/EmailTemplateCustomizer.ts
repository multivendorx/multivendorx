import { __ } from '@wordpress/i18n';
import { salesReport } from '../../../assets/template/emailTemplate/salesReport';

const EMAIL_BLOCK_GROUPS = [
    {
        id: 'email',
        label: 'Email Blocks',
        blocks: [
            {
                id: 'columns',
                icon: 'blocks',
                value: 'columns',
                label: 'Columns',
                fixedName: 'columns',
            },
            {
                id: 'heading',
                icon: 'form-textarea',
                value: 'heading',
                fixedName: 'heading',
                placeholder: 'Enter your heading here',
            },
            {
                id: 'richtext',
                icon: 't-letter-bold',
                value: 'richtext',
                fixedName: 'richtext',
                placeholder: 'Enter your text content here',
            },
            {
                id: 'image',
                icon: 'image',
                value: 'image',
                label: 'Image',
                fixedName: 'image',
            },
            {
                id: 'button',
                icon: 'button',
                value: 'button',
                fixedName: 'button',
                placeholder: 'Click me',
            },
            {
                id: 'section',
                icon: 'section',
                value: 'section',
                fixedName: 'section',
            },
        ],
    },
];

export default {
	id: 'email-template-customizer',
	priority: 3,
	headerTitle: __('Email Template Customizer', 'multivendorx'),
	headerDescription: __(
		'Edit and manage individual email templates used across the marketplace.',
		'multivendorx'
	),
	headerIcon: 'search-discovery',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_registration_from',
			type: 'block-builder',
			classes: 'full-width',
			emailTemplates: [salesReport],
			blockGroups: EMAIL_BLOCK_GROUPS,
            visibleGroups: ['email'],
            context: 'email',
			defaultTemplateId: 'store-registration',
		},
	],
};
