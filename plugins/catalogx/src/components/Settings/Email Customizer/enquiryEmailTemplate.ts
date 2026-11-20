import { __ } from '@wordpress/i18n';
import { OuterSpace } from '../../../assets/template/OuterSpace';
import { GreenLagoon } from '../../../assets/template/GreenLagoon';
import { CrimsonValley } from '../../../assets/template/CrimsonValley';
import { MoonlitSky } from '../../../assets/template/MoonlitSky';
import { Starlight } from '../../../assets/template/Starlight';


export default {
    id: 'enquiry-email-template',
    priority: 1,
    headerTitle: __('Enquiry', 'catalogx'),
    headerDescription: __(
        'Customize the email template used for enquiry notifications.',
        'catalogx'
    ),
    headerIcon: 'enquiry',
    groupBySections: true,
    hideSettingHeader: true,
    submitUrl: 'settings',
    modal: [
        {
            key: 'enquiry_email_section',
            type: 'section',
            icon: 'enquiry',
            title: __('Enquiry email', 'catalogx'),
            desc: __(
                'The email sent for each new enquiry. Start from a template, then edit its blocks.',
                'catalogx'
            ),
        },
        {
            key: 'notice',
            type: 'notice',
            message: __(
                'Start from one of the templates below, then change its text, colours and layout block by block.',
                'catalogx'
            ),
            noticeType: 'info',
            display: 'inline-notice',
        },
        {
            key: 'enquiry_email_template',
            type: 'builderform-email',
            classes: 'full-width',
            emailTemplates: [OuterSpace, GreenLagoon, CrimsonValley, MoonlitSky, Starlight],
            availablePlaceholder: appLocalizer.email_tags,
            // CatalogX Pro's EmailHTMLConverter writes style numbers as rem.
            styleUnit: 'rem',
            defaultTemplateId: 'store-registration',
            proSetting: true,
        },
    ],
};
