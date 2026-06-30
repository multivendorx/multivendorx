import { __ } from '@wordpress/i18n';

export default {
    id: 'personalize-layout',
    priority: 2,
    headerTitle: __( 'Personalize Layout', 'notifima' ),
    headerDescription: __( 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet', 'notifima' ),
    headerIcon: 'form',
    submitUrl: 'settings',
    modal: [
        {
			key: 'personalize_layout_template',
			type: 'block-builder',
			label: __( 'Personalize Layout', 'notifima' )
		},
    ],
};
