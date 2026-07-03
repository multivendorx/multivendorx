import { __ } from '@wordpress/i18n';
import {OuterSpace} from '../../../assets/template/OuterSpace';
import { GreenLagoon } from '../../../assets/template/GreenLagoon';
import { CrimsonValley } from '../../../assets/template/CrimsonValley';
import { MoonlitSky } from '../../../assets/template/MoonlitSky';
import { Starlight } from '../../../assets/template/Starlight';


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
    id: 'enquiry-email-template',
    priority: 3,
    headerTitle: __('Email Customizations', 'catalogx'),
    headerDescription: __(
        'Customize your preferred enquiry details email template',
        'catalogx'
    ),
    headerIcon: 'enquiry',
    submitUrl: 'settings',
    modal: [
        {
            key: 'additional_alert_email',
            type: 'text',
            desc: __(
                "Set the email address to receive notifications when a user submits enquiry of a product. You can add multiple comma-separated emails.<br/> <b>Default:</b> The admin's email is set as the receiver. Exclude the admin's email from the list to exclude admin from receiving these notifications.",
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
			emailTemplates: [OuterSpace , GreenLagoon, CrimsonValley, MoonlitSky, Starlight],
			blockGroups: EMAIL_BLOCK_GROUPS,
            availablePlaceholder: appLocalizer.email_tags,
            visibleGroups: 'email',
            context:'email',
			defaultTemplateId: 'store-registration',
		},
    ],
};
