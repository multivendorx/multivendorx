import { __ } from '@wordpress/i18n';

export default {
	id: 'menu-manager',
	priority: 4,
	name: __('Dashboard Menu', 'multivendorx'),
	desc: __(
		'Choose which menus to show or hide in the store dashboard and arrange their display order.',
		'multivendorx'
	),
	icon: 'adminfont-menu-manager',
	submitUrl: 'settings',
	modal: [
		{
			key: 'menu_manager',
			label: __( 'Menu manager', 'multivendorx' ),
			type: 'endpoint-editor',
			apiLink: 'endpoints',
		},
	],
};
