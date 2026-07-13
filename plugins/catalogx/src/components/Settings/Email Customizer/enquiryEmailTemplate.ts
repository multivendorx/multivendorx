import { __ } from '@wordpress/i18n';
import { OuterSpace } from '../../../assets/template/OuterSpace';
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
    priority: 1,
    headerTitle: __('Enquiry', 'catalogx'),
    headerDescription: __(
        'Customize the email template used for enquiry notifications.',
        'catalogx'
    ),
    headerIcon: 'enquiry',
    submitUrl: 'settings',
    modal: [
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
            emailTemplates: [OuterSpace, GreenLagoon, CrimsonValley, MoonlitSky, Starlight],
            blockGroups: EMAIL_BLOCK_GROUPS,
            availablePlaceholder: appLocalizer.email_tags,
            visibleGroups: 'email',
            context: 'email',
            defaultTemplateId: 'store-registration',
            proSetting: true,
        },
    ],
};
