import { __, sprintf } from '@wordpress/i18n';
export default {
    id: 'personalize-layout',
    priority: 2,
    headerTitle: __( 'Personalize Layout', 'notifima' ),
    headerDescription: __( 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet', 'notifima' ),
    headerIcon: 'form',
    submitUrl: 'settings',
    modal: [
        {
			key: 'store_registration_from',
			type: 'block-builder',
			classes: 'full-width',
			visibleGroups: ['form-customizer'],
			defaultTemplateId: 'store-registration',
			context: 'form-customizer',
		},
    ],
};
