import { __ } from '@wordpress/i18n';

export default {
    id: 'wholesale-registration',
    priority: 70,
    headerTitle: __( 'Wholesale', 'catalogx' ),
    headerDescription: __(
        'Drag-and-drop interface to tailor the wholesale registration form.',
        'catalogx'
    ),
    headerIcon: 'contact-form',
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
