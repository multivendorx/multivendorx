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
                "When a customer submits an enquiry for a product, the enquiry details will be sent to the email address(es) entered here. Add multiple email addresses separated by commas.<br/> <b>Default:</b> The site administrator's email is included by default. To stop the admin from receiving enquiry notifications, remove the admin email address from this list.",
                'catalogx'
            ),
            label: __('Recipient email for product enquiries', 'catalogx'),
            moduleEnabled: 'enquiry',
        },
        {
            key: 'notice',
            type: 'notice',
            message: __(
                "Use personalization tags to make your emails more engaging - for example, use <b>{user_name}</b> to display the subscriber's name and <b>{email_tag}</b> to display their email address automatically.",
                'catalogx'
            ),
            noticeType: 'info',
            display: 'inline-notice',
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
