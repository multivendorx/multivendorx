import { __ } from '@wordpress/i18n';
import {OuterSpace} from '../../assets/template/OuterSpace';


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
    id: 'enquiry-email-temp',
    priority: 50,
    headerTitle: __('Enquiry Email', 'catalogx'),
    headerDescription: __(
        'Select your preferred enquiry details email template',
        'catalogx'
    ),
    headerIcon: 'enquiry',
    submitUrl: 'settings',
    modal: [
        {
            key: 'additional_alert_email',
            type: 'text',
            desc: __(
                "Set the email address to receive notifications when a user submits enquiry of a product. You can add multiple comma-separated emails.<br/> Default: The admin's email is set as the receiver. Exclude the admin's email from the list to exclude admin from receiving these notifications.",
                'catalogx'
            ),
            label: __('Recipient email for new subscriber', 'catalogx'),
            moduleEnabled: 'enquiry',
        },
        {
			key: 'enquiry_email_template',
			type: 'block-builder',
			classes: 'full-width',
			// desc: 'Customise personalised store registration form for marketplace.',
			// // Add templates configuration with proper content
			emailTemplates: [OuterSpace],
			blockGroups: EMAIL_BLOCK_GROUPS,
            availablePlaceholder: ['{customer_name}', '{customer_email}', '{product_name}', '{product_link}'],
            visibleGroups: 'email',
            context:'email',
			defaultTemplateId: 'store-registration',
		},
    ],
};
