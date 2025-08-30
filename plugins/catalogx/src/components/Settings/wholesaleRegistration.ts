import { __ } from '@wordpress/i18n';

export default {
    id: 'wholesale-registration',
    priority: 70,
    name: __( 'Custom Wholesale Form Builder', 'catalogx' ),
    desc: __(
        'Drag-and-drop interface to tailor the wholesale registration form.',
        'catalogx'
    ),
    icon: 'adminlib-contact-form',
    submitUrl: 'settings',
    modal: [
        {
            key: 'wholesale_from_settings',
            type: 'form-builder',
            classes: 'no-label',
            proSetting: true,
        },
    ],
};
