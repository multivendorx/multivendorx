import { __ } from '@wordpress/i18n';

export default {
    id: 'enquiry-email-temp',
    priority: 5,
    name: __( 'Enquiry Email', 'catalogx' ),
    desc: __(
        'Select your preferred enquiry details email template',
        'catalogx'
    ),
    icon: 'adminlib-contact-form',
    submitUrl: 'settings',
    modal: [
        {
            key: 'additional_alert_email',
            type: 'textarea',
            class: 'basic-input',
            desc: __(
                "Set the email address to receive notifications when a user submits enquiry of a product. You can add multiple comma-separated emails.<br/> Default: The admin's email is set as the receiver. Exclude the admin's email from the list to exclude admin from receiving these notifications.",
                'catalogx'
            ),
            label: __( 'Recipient email for new subscriber', 'catalogx' ),
            moduleEnabled: 'enquiry',
        },
        {
            key: 'selected_email_tpl',
            type: 'radio-select',
            label: 'Store Header',
            desc: 'Select store banner style',
            options: [
                {
                    key: 'template1',
                    label: 'Outer Space',
                    color: appLocalizer.template1,
                    value: 'template1',
                },
                {
                    key: 'template2',
                    label: 'Green Lagoon',
                    color: appLocalizer.template2,
                    value: 'template2',
                },
                {
                    key: 'template3',
                    label: 'Old West',
                    color: appLocalizer.template3,
                    value: 'template3',
                },
                {
                    key: 'template4',
                    label: 'Old West',
                    color: appLocalizer.template4,
                    value: 'template4',
                },
                {
                    key: 'template5',
                    label: 'Old West',
                    color: appLocalizer.template5,
                    value: 'template5',
                },
                {
                    key: 'template6',
                    label: 'Old West',
                    color: appLocalizer.template6,
                    value: 'template6',
                },
                {
                    key: 'template7',
                    label: 'Old West',
                    color: appLocalizer.template7,
                    value: 'template7',
                },
            ],
            moduleEnabled: 'enquiry',
            proSetting: true,
        },
    ],
};
