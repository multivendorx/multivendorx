import { __ } from '@wordpress/i18n';

export default {
    id: 'enquiry-form-customization',
    priority: 30,
    name: __('Enquiry Form Builder', 'catalogx'),
    desc: __(
        'Design a personalized enquiry form with built-in form builder.',
        'catalogx'
    ),
    icon: 'adminfont-contact-form',
    submitUrl: 'settings',
    modal: [
        {
            key: 'form_customizer',
            type: 'form-customizer',
            desc: __('Form Customizer', 'catalogx'),
            classes: 'form_customizer',
            moduleEnabled: 'enquiry',
            proSetting: true,
        },
    ],
};
