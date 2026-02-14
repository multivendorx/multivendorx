import { __ } from '@wordpress/i18n';
import {temp1} from '../../../assets/template/emailTemplate/temp1';
import {temp2} from '../../../assets/template/emailTemplate/temp2';

export default {
    id: 'email-template-customizer',
    priority: 3,
    headerTitle: __('Email Template Customizer', 'multivendorx'),
    headerDescription: __(
        'Edit and manage individual email templates used across the marketplace.',
        'multivendorx'
    ),
    headerIcon: 'adminfont-store-seo',
    submitUrl: 'settings',
    modal: [
        {
            key: 'store_registration_from',
            type: 'email-template',
            classes: 'full-width',
            desc: 'Customise personalised store registration form for marketplace.',
            // Add templates configuration with proper content
            templates: [
                temp1,
                temp2,
            ],
            defaultTemplateId: 'store-registration',
        },
    ]
};